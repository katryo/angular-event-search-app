export class Query {
  keyword: string;
  category: string;
  radius: number;
  unit: string;
  from: string;
  fromTerm: string;

  constructor(
    keyword: string,
    category: string,
    radius: number,
    unit: string,
    from: string,
    fromTerm: string
  ) {
    this.keyword = keyword;
    this.category = category;
    this.radius = radius;
    this.unit = unit;
    this.from = from;
    this.fromTerm = fromTerm;
  }
}
