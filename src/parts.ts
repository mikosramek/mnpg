const schemaQuery = `
{
  __schema {
    types {
      kind
      name
      possibleTypes {
        name 
      }
    }
  }
}
`;

module.exports = {
  schemaQuery,
};
