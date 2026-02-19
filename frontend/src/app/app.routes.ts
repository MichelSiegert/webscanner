import {Routes} from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { MapLayout } from './components/map-layout/map-layout';
import { SearchLayout } from './components/search-layout/search-layout';
import { Impressum } from './components/impressum/impressum';
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
    {
      path: "impressum",
      component: Impressum
    }

  ]
  }
];
