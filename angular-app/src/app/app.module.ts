import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EventSearchComponent } from "./event-search/event-search.component";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTooltipModule } from "@angular/material/tooltip";
import { EventNamePipe } from "./event-name.pipe";
import { RoundProgressModule } from "angular-svg-round-progressbar";
import { AgmCoreModule } from "@agm/core";

@NgModule({
  declarations: [AppComponent, EventSearchComponent, EventNamePipe],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    RoundProgressModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyB-c1cm-GD-42YecmJJ_kzk-7l-X4nFp6A"
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
