# FreeAgent / CHPW

1. FreeAgent screen pop ANI (phone number) query results to answering agent

   1. **FA API#1: Contact Query by Phone Number**
      1. On single result - screen pop that contact's record in the agent's active web browser.
      2. On multiple results - screen pop the FreeAGent search results page (assuming we can get some sort of URL from the API for the search page) in the agent's active browser.
      3. On no results - create a new contact record for that customer and scree pop that record in the agent's active browser.
         1. **FA AP#2: Create FreeAgent Contact Record**
            1. Params needed for API call:
               1. First Name - will always be 'TBD' because we don't know what customer's first name is
               2. Agent Code
                  1. **FA API #3: Agent Code query by Agent Email**
                     1. Key Assumptions:
                        1. the agent's email address will be the same in FreeAgent AND RingCentral
                        2. there will be only 1 user associated with 1 email address

## **FreeAgent API**

FreeAgent CRM platform exposes a graphql API endpoint, essentially any data/operation you can access via FreeAgent web interface is available via APIs.

## **Authentication**

API authentication is via OAuth2 protocol, using client credential grants.
Below you will find a few sample requests, you can use any language/library of choice for actual integration.

```http
POST https://freeagent.network/oauth/token
```

### Request Example

```bash
curl --location 'POST https://freeagent.network/oauth/token' \
--header 'Content-Type: application/json' \
--data '{
    "grant_type": "client_credentials",
    "client_id": "{client_id}",
    "client_secret": "{fa_secret}"
}'
```

### Response Example

```json
{
  "access_token": "31N2hEzxToeLDi2J...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

## **Rate Limits**

Integrations API calls are subject to the limit of 50 requests per 10 seconds window. Please reach out to Support team in case you need this limit changed.

Integrations exceeding the limits will receive error responses with a 429 response code.

It is recommended to implement an exponential back-off approach on 429 response code.

## **Status Codes**

| Status Code | Description             |
| :---------- | :---------------------- |
| 200         | `OK`                    |
| 400         | `BAD REQUEST`           |
| 401         | `UNAUTHORIZED`          |
| 429         | `TOO MANY REQUESTS`     |
| 500         | `INTERNAL SERVER ERROR` |
| 503         | `SERVICE UNAVAILABLE`   |

## **Queries**

A GraphQL **query** is used to read or fetch values;

a **mutation** is used to modify or delete values.

```http
POST https://freeagent.network/api/graphql
```

---

### FA API#1: **Query** Contact by Phone Number

QUERY

```text
query listEntityValues($entity: String!, $fields: [String], $order: [[String]], $limit: Int, $offset: Int, $pattern: String, $filters: [Filter]) {
  listEntityValues(entity: $entity, fields: $fields, order: $order, limit: $limit, offset: $offset, pattern: $pattern, filters: $filters) {
    count
    entity_values {
      id
      seq_id
      field_values
    }
  }
}
```

GRAPHQL VARIABLES

```json
{
  "entity": "contact",
  "filters": [
      {
          "field_name": "alternate_phone_1",
          "operator": "equals",
          "values": [{phone_number_string}]
      }
    ]
}
```

---

### FA AP#2: **Create** FreeAgent Contact Record

QUERY

```text
mutation createEntity($entity: String!, $field_values: JSON!) {
  createEntity(entity: $entity, field_values: $field_values) {
    entity_value {
      id
      seq_id
      field_values
    }
  }
}
```

GRAPHQL VARIABLES

```json
{
  "entity": "contact",
  "field_values": {
    "alternate_phone_1": "1234567890",
    "first_name": "test",
    "work_email": "test@test.com"
  }
}
```

---

### FA API #3: Query Agent Code by Agent Email

QUERY

```text
query listEntityValues($entity: String!, $fields: [String], $order: [[String]], $limit: Int, $offset: Int, $pattern: String, $filters: [Filter]) {
  listEntityValues(entity: $entity, fields: $fields, order: $order, limit: $limit, offset: $offset, pattern: $pattern, filters: $filters) {
    count
    entity_values {
      id
      seq_id
      field_values
    }
  }
}
```

GRAPHQL VARIABLES

```json
{
  "entity" : "employee",
  "filters": [
    {
      "field_name": "employee_field3",
      "operator": "equals",
      "values": ["test@test.com"]
    }
  ]
}
```
# chpw
