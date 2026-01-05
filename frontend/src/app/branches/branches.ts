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


  ngOnInit(): void {
    this.jsonReaderService.dataSource.subscribe((data: TreeNode[])=>{
      this.app = data;
      this.uniqueCrafts = this.getUniqueCrafts(data);
      this.selectedCrafts = new Set(this.uniqueCrafts);
      this.craftFilter.craftSource.next(this.selectedCrafts);

    })
  }

toggleCraft(craft: string, checked: boolean) {
  checked
    ? this.selectedCrafts.add(craft)
    : this.selectedCrafts.delete(craft);
  this.craftFilter.craftSource.next(this.selectedCrafts);

}

  constructor(private jsonReaderService: JsonReaderService, private craftFilter: CraftFilter){}


  getUniqueCrafts(data: TreeNode[]): string[]{
  const crafts = new Set<string>();

  data.forEach((item: TreeNode) => {
    const tagsNode = item.children?.find(c => c.name === 'tags');
    if (!tagsNode) return;

    tagsNode.children?.forEach(tag => {
      if (tag.name.startsWith('craft:')) {
        const craftValue = tag.name.split('craft:')[1].trim();
        crafts.add(craftValue);
      }
    });
  });

  return Array.from(crafts);
}


}
