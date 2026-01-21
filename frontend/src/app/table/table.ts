import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { JsonReaderService } from '../services/json-reader';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CraftFilter } from '../services/craft-filter';
import { TreeNode, updateTree, upsertTag } from '../../data/TreeNode';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  imports: [
    MatInputModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table implements OnInit{

  public entries : any[]= [];
  public filteredEntries: any[] = [];
  public paginatedEntries: any[] = [];
  private currentPageSize = 5;
  public currentPageIndex = 0;

  private selectedCrafts: Set<string> = new Set();

  constructor(private jsonReader: JsonReaderService, private http: HttpClient, private craftFilter: CraftFilter) {}
  ngOnInit(): void {
    this.jsonReader.currentJSON.subscribe((e:any)=>{
      this.entries = this.createEntries(e);

      this.applyFilter();

    });


    this.craftFilter.craftSource.subscribe((crafts) => {
      this.currentPageIndex= 0;
      this.selectedCrafts = crafts;
      this.applyFilter();
    });
  }


  updatePagination() {
    const startIndex = this.currentPageIndex * this.currentPageSize;
    const endIndex = startIndex + this.currentPageSize;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
    this.updatePagination();
  }

triggerAction(customer: any) {
  if (customer.isAnalyzing) return;
  customer.isAnalyzing = true;
  this.http.get(`/api/search?company=${customer.name}&city=${customer.city}`)
  .subscribe((result:any)=>{
    const links = (result?.websites || []).map((r: any) => r.link).filter((link: any) => !!link);
    customer.website = links.join(', ');

    const website = links.join(', ');
    const email = (result?.emails || []).join(", ");

    const updated = updateTree(
    this.jsonReader.dataSource.value,
    (node: TreeNode) => node.key === customer.name,
    node => {
          const updatedNode = this.updateTagsInNode(node, {
            isAnalyzing: 'false',
            finishedAnalyzing: 'true',
            email: email,
            website: website
          });
          return updatedNode;
        }
  );
  this.jsonReader.dataSource.next(updated)
  });
}

sendMail(customer: any) {
  console.log(customer);
  if(customer.mailSent2) return;

  this.http.get(`/email?website=${customer.selectedWebsite}&email=${customer.selectedEmail}`)
  .subscribe((result: any)=>{
    if(result.status == 200) this.persistSelection(customer,"mailSent", "true");
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
    this.currentPageIndex = 0;
    this.updatePagination();
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
    const email = this.getValueOF(customer, "email") ?? [];

    let website = this.getValueOF(customer, "website") || "";

    if (website && !/^https?:\/\//i.test(website)) {
        website = 'https://' + website;
    }
    const websiteUrls = website
      ? website.split(',').map(w => w.trim()).filter(Boolean)
      : [];
    const selectedWebsite = this.getValueOF(customer, "selectedWebsite") || (websiteUrls[0] ?? null);
    const selectedEmail = this.getValueOF(customer, "selectedEmail") || (email.split(", ")[0] ?? null);

    const name = this.getValueOF(customer, "name");
    const city = this.getValueOF(customer, "city");
    const craft = this.getValueOF(customer, "craft");
    const isAnalyzing = this.getValueOF(customer, "isAnalyzing") === 'true';
    const finishedAnalyzing = this.getValueOF(customer, "finishedAnalyzing") === 'true';
    const mailSent = this.getValueOF(customer, "mailSent")

    return {email, selectedEmail, website, selectedWebsite, name, city, craft, isAnalyzing, finishedAnalyzing, mailSent};
    });
  return formattedTags;
  }

  private getValueOF(customer: any[], value: string): string{
    return customer.find((e)=>e.key === value)?.value ?? "";
  }

  private updateTagsInNode(node: TreeNode, tagsToUpdate: {[key: string]: string}): TreeNode {
    if (!node.children) return node;
    return {
      ...node,
      children: node.children.map(child => {
        if (child.key !== 'tags') return child;
        let tagsNode = child;
        Object.keys(tagsToUpdate).forEach(key => {
          if (tagsToUpdate[key]) {
            tagsNode = upsertTag(tagsNode, key, tagsToUpdate[key]);
          }
        });
        return tagsNode;
      })
    };
  }

persistSelection(customer: any, key: string, value: string) {
  const updated = updateTree(
    this.jsonReader.dataSource.value,
    (node: TreeNode) => node.key === customer.name,
    (node: TreeNode) => {
      if (!node.children) return node;

      return {
        ...node,
        children: node.children.map(child => {
          if (child.key !== 'tags') return child;
          let tagsNode = child;
          tagsNode = upsertTag(tagsNode, key, value);
          return tagsNode
        })
      };
    }
  );
  this.jsonReader.dataSource.next(updated);
}
}
