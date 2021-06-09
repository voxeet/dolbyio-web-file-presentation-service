import JSZip from 'jszip';

const getPresentation = async (file) => {
    const getNotesSlides = async (zipFile) => {
        const parser = new DOMParser();
        const notesSlides = [];

        const strContent = await zipFile.file('[Content_Types].xml').async('string');
        const xmlDocument = parser.parseFromString(strContent, 'text/xml');
        const overrides = xmlDocument.getElementsByTagName('Override');

        // <Override PartName="/ppt/notesSlides/notesSlide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>
        for (let index = 0; index < overrides.length; index++) {
            const override = overrides[index];
            const contentType = override.getAttribute('ContentType');
            if (contentType === 'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml') {
                const partName = override.getAttribute('PartName').substr(1); // Remove the first /
                notesSlides.push(partName);
            }
        }

        return notesSlides;
    };

    const extractNotes = async (zipFile, filename) => {
        const file = zipFile.file(filename);
        if (!file) return null;

        const P_NAMESPACE = 'http://schemas.openxmlformats.org/presentationml/2006/main';
        const A_NAMESPACE = 'http://schemas.openxmlformats.org/drawingml/2006/main';

        const xmlContent = await file.async('string');
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(xmlContent, 'text/xml');
        const spElements = xmlDocument
            .getElementsByTagNameNS(P_NAMESPACE, 'cSld')[0]
            .getElementsByTagNameNS(P_NAMESPACE, 'spTree')[0]
            .getElementsByTagNameNS(P_NAMESPACE, 'sp');

        for (let index = 0; index < spElements.length; index++) {
            const spElement = spElements[index];

            const name = spElement.getElementsByTagNameNS(P_NAMESPACE, 'nvSpPr')[0].getElementsByTagNameNS(P_NAMESPACE, 'cNvPr')[0].getAttribute('name');

            if (name.indexOf('Notes Placeholder') < 0) continue;

            const pElements = spElement.getElementsByTagNameNS(P_NAMESPACE, 'txBody')[0].getElementsByTagNameNS(A_NAMESPACE, 'p');

            const notes = [];

            for (let j = 0; j < pElements.length; j++) {
                const pElement = pElements[j];
                var string = '';

                const rElements = pElement.getElementsByTagNameNS(A_NAMESPACE, 'r');
                for (let k = 0; k < rElements.length; k++) {
                    const rElement = rElements[k];
                    string += rElement.getElementsByTagNameNS(A_NAMESPACE, 't')[0].innerHTML;
                }

                if (string.length > 0) {
                    notes.push(string);
                }
            }

            return notes.length > 0 ? notes : null;
        }

        return null;
    };

    const zipFile = await JSZip.loadAsync(file);
    //console.log(zipFile);

    const notesSlides = await getNotesSlides(zipFile);

    const regex = /\d+/g;

    const slides = {};

    for (let index = 0; index < notesSlides.length; index++) {
        const filename = notesSlides[index];

        const match = filename.match(regex);
        if (match) {
            const slideId = parseInt(match[0]) - 1;
            const notes = await extractNotes(zipFile, filename);
            if (notes != null) {
                slides[slideId] = notes;
            }
        }
    }

    return slides;
};

export default { getPresentation };
