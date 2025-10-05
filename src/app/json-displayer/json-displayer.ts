import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTree, MatTreeNode, MatTreeNodeDef } from '@angular/material/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { JsonReader } from '../json-reader';

@Component({
  selector: 'app-json-displayer',
  imports: [MatTree, MatTreeNode, MatIcon, MatTreeNodeDef, MatTreeModule, MatIconModule, MatButtonModule, MatIcon, MatIconButton],
  templateUrl: './json-displayer.html',
  styleUrl: './json-displayer.css'
})
export class JsonDisplayer implements OnInit {
  public dataSource: TreeNode[]=[];
  constructor(private jsonReader: JsonReader){}
  ngOnInit(): void {
    this.jsonReader.loadGeoJSON();
        this.jsonReader.currentJSON.subscribe((newJSON :TreeNode[])=>{
      this.dataSource = newJSON;
    });
  }

  downloadJson(): void {
    const jsonString = JSON.stringify(this.dataSource, null, 2); 

    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'myData.json'; 
    a.click();
    window.URL.revokeObjectURL(url);
  }
    

  childrenAccessor = (node: TreeNode) => node.children ?? [];
  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;
}
