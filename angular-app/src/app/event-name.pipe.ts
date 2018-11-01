import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "eventName" })
export class EventNamePipe implements PipeTransform {
  transform(name: string): string {
    if (name.length <= 35) {
      return name;
    }
    let i = 35;
    while (name.charAt(i) !== " ") {
      i -= 1;
    }
    return name.substring(0, i) + "...";
  }
}
