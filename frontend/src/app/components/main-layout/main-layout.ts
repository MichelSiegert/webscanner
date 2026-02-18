  import { Component } from '@angular/core';
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-main-layout',
  imports: [Footer, Header, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
