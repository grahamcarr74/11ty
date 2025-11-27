import { contentType } from '@optimizely/cms-sdk';

export const BlankExperience = contentType({
    key: 'BlankExperience',
    baseType: '_page',
    displayName: 'Blank Experience',
    properties: {
        // Composition is a special property, usually handled automatically or via specific type
        // For now, we define it as a property if needed, or rely on the SDK's handling of Visual Builder types
        // The SDK might not need explicit definition for composition if it's built-in for Experience types
        // But let's define it to be safe if we can find the type.
        // If not, we'll leave it out and see if the SDK fetches it automatically for Experience types.
        // Actually, for Visual Builder, it's often 'composition'.
    },
});
