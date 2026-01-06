import { Component, OnInit } from '@angular/core';
import { JsonReaderService } from '../json-reader';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { CraftFilter } from '../craft-filter';

@Component({
  selector: 'app-branches',
  imports: [CommonModule, MatCheckbox],
  templateUrl: './branches.html',
  styleUrl: './branches.css'
})
export class Branches implements OnInit {
  app: TreeNode[] = [];
  uniqueCrafts: string[] = [];
  selectedCrafts = new Set<string>();

  constructor(private jsonReaderService: JsonReaderService, private craftFilter: CraftFilter){}


  ngOnInit(): void {
    this.jsonReaderService.dataSource.subscribe((data: TreeNode[])=>{
      this.app = data;
      this.uniqueCrafts = this.getUniqueCrafts(data);
    })
  }

  toggleCraft(craft: string, checked: boolean) {
    checked
      ? this.selectedCrafts.add(craft)
      : this.selectedCrafts.delete(craft);
    this.craftFilter.craftSource.next(this.selectedCrafts);
  }

  getUniqueCrafts(data: TreeNode[]): string[]{
    const crafts = new Set<string>();

    data.forEach((item: TreeNode) => {
      const tagsNode = item.children?.find(c => c.key === 'tags');
      if (!tagsNode) return;

      tagsNode.children?.forEach(tag => {
        if (tag.key.startsWith('craft')) {
          const craftValue = tag.value!.trim();
          crafts.add(craftValue);
        }
      });
    });

    return Array.from(crafts);
  }
}
