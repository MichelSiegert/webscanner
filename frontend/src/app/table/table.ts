import { Component, OnInit } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { JsonReaderService } from '../json-reader';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  constructor(private jsonReader: JsonReaderService, private http: HttpClient) {}
  ngOnInit(): void {
    this.jsonReader.currentJSON.subscribe((e)=>{
      this.entries = this.createEntries(e);
    });
  }

  private createEntries(data: any[]){
    const tags: any[] = data.map((customer:any)=>{
      return [...((customer.children ?? [])
      .find((e:any) =>e.name === "tags")
      ?.children ?? [])]
    });
    const unpackedTags = tags.map((customer: any[])=>{
      return customer.map((tags:any)  =>{
        const split:string[] = tags.name.split(":");
        const key: string = split[split.length -2];
        const value: string = split[split.length - 1];
        return {key, value}
    });
  });
  const formattedTags = unpackedTags.map((customer:any)=>{
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
