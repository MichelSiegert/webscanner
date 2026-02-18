import {Routes} from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { MapComponent } from './components/map/map';
import { MapLayout } from './components/map-layout/map-layout';
import { SearchLayout } from './components/search-layout/search-layout';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [{
      path: "",
      component: MapLayout
    },
    {
      path: "search",
      component: SearchLayout
    },

  ]
  }
];
