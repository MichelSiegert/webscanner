import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { JsonReaderService } from '../json-reader';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CraftFilter } from '../craft-filter';

@Component({
  selector: 'app-table',
  imports: [MatInputModule, CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnInit{

triggerAction(customer: any) {
  this.http.get(`http://localhost:3000/search?company=${customer.name}&city=${customer.city}`).subscribe((result:any)=>{
    const links = (result?.websites || []).map((r: any) => r.link).filter((link: any) => !!link);
    customer.website = links.join(', ');
    customer.email = (result?.emails || []).join(", ");
  });
}
  public entries : any[]= [];
  public filteredEntries: any[] = [];

  private selectedCrafts: Set<string> = new Set();


  constructor(private jsonReader: JsonReaderService, private http: HttpClient, private craftFilter: CraftFilter) {}
  ngOnInit(): void {
    this.jsonReader.currentJSON.subscribe((e:any)=>{
      this.entries = this.createEntries(e);
      this.applyFilter();

    });


    this.craftFilter.craftSource.subscribe((crafts) => {
      this.selectedCrafts = crafts;
      this.applyFilter();
    });
  }

  private applyFilter() {
    if (this.selectedCrafts.size === 0) {
      this.filteredEntries = [...this.entries];
    } else {
      this.filteredEntries = this.entries.filter(entry =>
        this.selectedCrafts.has(entry.craft.trim())
      );
    }
  }


  private createEntries(data: any[]){

    const tagsArray: any[] = data.map((customer: any)=>{return [... ((customer.children ?? [])).find((e:TreeNode)=> e.key ==="tags").children ?? []]});
    const clearedTags = tagsArray.map((tags: TreeNode[]) => {
      tags.map((tag: TreeNode)=>{
      if (tag.key?.includes(":")) {
        return {
          ...tag,
          key: tag.key.slice(tag.key.lastIndexOf(":") + 1)
        };
      }
      return tag;
      });
      return tags;
    });

    const formattedTags = clearedTags.map((customer:TreeNode[])=>{
    console.log(customer);
    const email = this.getValueOF(customer, "email");
    const websiteStr = this.getValueOF(customer, " http");
    const website =  websiteStr?"http:" + websiteStr: "";
    const name = this.getValueOF(customer, "name");
    const city = this.getValueOF(customer, "city");
    const craft = this.getValueOF(customer, "craft");
    return {email, website, name, city, craft};
    });
  return formattedTags;
}

  private getValueOF(customer: any[], value: string): string{
    return customer.find((e)=>e.key === value)?.value ?? "";
  }
}
