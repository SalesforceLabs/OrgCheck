export class OrgCheckRecipe {

    extract(parameters) {
        console.error('parameters:', parameters);
        throw new Error('You need to implement the method "extract(parameters)"');
    }

    transform(data) {
        console.error('data:', data);
        throw new Error('You need to implement the method "transform(data)"');
    }
}