declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    text(text: string, x: number, y: number, options?: any): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    setFontSize(size: number): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    save(filename: string): jsPDF;
    // Add other methods you're using from jsPDF here
  }
}