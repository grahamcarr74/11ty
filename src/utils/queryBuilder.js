function generateFields(properties) {
    return Object.entries(properties).map(([key, prop]) => {
        if (prop.type === 'string') {
            return key;
        }
        if (prop.type === 'url') {
            return `${key} { default }`;
        }
        if (prop.type === 'contentReference') {
            return `${key} { key }`; // Basic reference
        }
        // Add more types as needed
        return key;
    }).join('\n');
}

function generateBlockFragments(models) {
    const fragments = [];
    const componentFragmentParts = [];

    for (const model of Object.values(models)) {
        if (model.baseType === '_block') {
            const fields = generateFields(model.properties || {});
            const fragmentName = model.key;

            fragments.push(`
        fragment ${fragmentName} on ${fragmentName} {
          _metadata { key displayName }
          ${fields}
        }
      `);

            componentFragmentParts.push(`...${fragmentName}`);
        }
    }

    const componentFragment = `
    fragment _IComponent on _IComponent {
      __typename
      ${componentFragmentParts.join('\n')}
    }
  `;

    return [componentFragment, ...fragments].join('\n');
}

module.exports = { generateBlockFragments };
