import { contentType } from '@optimizely/cms-sdk';

export const ButtonBlock = contentType({
    key: 'ButtonBlock',
    baseType: '_block',
    displayName: 'Button Block',
    properties: {
        Text: {
            type: 'string',
            displayName: 'Text',
        },
        Url: {
            type: 'url',
            displayName: 'Url',
        },
    },
});
