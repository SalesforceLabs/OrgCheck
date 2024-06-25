export class OrgCheckRecipe {

    extract(parameters) {
        console.error('parameters:', parameters);
        throw new TypeError('You need to implement the method "extract(parameters)"');
    }

    async transform(data) {
        console.error('data:', data);
        throw new TypeError('You need to implement the method "transform(data)"');
    }
}