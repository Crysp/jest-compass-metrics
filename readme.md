# Jest → Compass

Upload Jest metrics to Compass.

## Inputs

### `jira-user`

**Required** JIRA User.

### `jira-token`

**Required** JIRA API Token.

### `test-script`

**Required** Command to execute tests. Default `npm test`.

## Example usage

```yaml
uses: Crysp/jest-compass-metrics@main
with:
  jira-user: ${{ vars.JIRA_USER }}
  jira-token: ${{ secrets.JIRA_API_TOKEN }}
  test-script: 'yarn test'
```
