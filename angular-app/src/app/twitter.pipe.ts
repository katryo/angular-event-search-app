import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "twitterUrl" })
export class TwitterUrlPipe implements PipeTransform {
  transform(name: string): string {
    const searchParams: URLSearchParams = new URLSearchParams();
    const text = `Check out ${name} located at`;
    searchParams.append("text", name);
    return `https://twitter.com/intent/tweet?${searchParams.toString()}`;
  }
}
