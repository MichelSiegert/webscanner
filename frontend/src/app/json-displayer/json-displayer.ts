import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTree, MatTreeNestedDataSource, MatTreeNode, MatTreeNodeDef } from '@angular/material/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { JsonReaderService } from '../json-reader';

@Component({
  selector: 'app-json-displayer',
  imports: [MatTree, MatTreeNode, MatIcon, MatTreeNodeDef, MatTreeModule, MatIconModule, MatButtonModule, MatIcon, MatIconButton],
  templateUrl: './json-displayer.html',
  styleUrl: './json-displayer.css'
})
export class JsonDisplayer implements OnInit {
  public dataSource = new MatTreeNestedDataSource<TreeNode>();
  constructor(private jsonReader: JsonReaderService){}
  ngOnInit(): void {
      this.jsonReader.currentJSON.subscribe((newJSON :TreeNode[])=>{
        this.dataSource.data = newJSON;
    });
  }

  downloadJson(): void {
    const jsonString = JSON.stringify(this.dataSource.data, null, 2);
    console.log(jsonString);

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
