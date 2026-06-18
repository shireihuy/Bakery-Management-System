const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);
const pdfPath = '../HK252-DATN-035.pdf';

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFileSync('./pdf-output.txt', pdfParser.getRawTextContent());
    console.log('Done!');
});

pdfParser.loadPDF(pdfPath);
