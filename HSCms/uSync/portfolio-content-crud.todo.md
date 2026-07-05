# Portfolio Content CRUD uSync Notes

The CRUD implementation expects these stable aliases to exist in the CMS schema:

- `portfolioHome`
- `portfolioContent`
- `experienceItem`
- `projectItem`
- `educationItem`
- `skillGroup`

Run a backoffice uSync export after creating or updating the document and element
types so the generated uSync files can replace this note. Do not commit users,
passwords, local databases, logs or machine-specific state.
