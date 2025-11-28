import { contentType } from '@optimizely/cms-sdk';

export const TextBlock = contentType({
    key: 'TextBlock',
    baseType: '_block',
    displayName: 'Text Block',
    properties: {
        Text: {
            type: 'string',
            displayName: 'Text',
        },
    },
});
