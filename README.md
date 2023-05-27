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
      "values": ["1234567890"]
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
  "entity": "employee",
  "filters": [
    {
      "field_name": "employee_field3",
      "operator": "equals",
      "values": ["test@test.com"]
    }
  ]
}
```

## Query CHPW Apps (entities)

QUERY

```text
query getEntities($alphabetical_order:Boolean) {
  getEntities(alphabetical_order:$alphabetical_order) {
    name
    display_name
    label
    label_plural
    entity_id
  }
}
```

GRAPHQL VARIABLES (optional)

```json
{
  "alphabetical_order": true
}
```

<details>

</br>

<summary> <h2>Entities in order of FreeAgent menu</h2> </summary>

![Screenshot of CHPW FreeAgent Menu](<https://github.com/freeagentcrm/chpw/assets/1093667/507d9eb8-f9b5-4c8e-8f4c-26397eed2e41> width=50%)

```json
{
  "data": {
    "getEntities": [
      {
        "name": "scheduled_report_fa",
        "display_name": "description",
        "label": "Scheduled Report",
        "label_plural": "Scheduled Reports",
        "entity_id": "e68de268-8e06-47a3-a37d-27a1ebca5f0d"
      },
      {
        "name": "contact",
        "display_name": "contact_field132",
        "label": "Contact",
        "label_plural": "Contacts",
        "entity_id": "ac12096d-027b-57f5-b389-93c1920222a3"
      },
      {
        "name": "logo",
        "display_name": "name",
        "label": "Account",
        "label_plural": "Accounts",
        "entity_id": "d72a990d-7bfa-55e7-9651-0b2b3889c311"
      },
      {
        "name": "chpw_event",
        "display_name": "chpw_event_field32",
        "label": "Event",
        "label_plural": "Events",
        "entity_id": "52905e7f-7362-4f0f-b81b-c11a7ee437ab"
      },
      {
        "name": "campaign",
        "display_name": "description",
        "label": "Campaign",
        "label_plural": "Campaigns",
        "entity_id": "52f0b9bb-da4b-4f2a-b6b9-9de19c8db97e"
      },
      {
        "name": "health_plan",
        "display_name": "health_plan_field3",
        "label": "Health Plan",
        "label_plural": "Health Plans",
        "entity_id": "aad6dc81-dac2-4ddf-8e38-c224f3dabd63"
      },
      {
        "name": "employee",
        "display_name": "employee_field10",
        "label": "Employee",
        "label_plural": "Employees",
        "entity_id": "55485e2a-7804-4c07-9422-6c268b1de6ad"
      },
      {
        "name": "zip_code",
        "display_name": "zip_code_field0",
        "label": "Zip Code",
        "label_plural": "Zip Codes",
        "entity_id": "11b82656-4b9f-427a-bfad-f278cc1a8ad3"
      },
      {
        "name": "referral_code",
        "display_name": "referral_code_field0",
        "label": "Referral Code",
        "label_plural": "Referral Codes",
        "entity_id": "da92eec8-746b-4341-9386-8ab8f6cefdaa"
      },
      {
        "name": "fa_activity",
        "display_name": "seq_id",
        "label": "Event Log",
        "label_plural": "Event Logs",
        "entity_id": "6937afa4-786c-5424-bc5b-41829a3eee64"
      },
      {
        "name": "task",
        "display_name": "description",
        "label": "Task",
        "label_plural": "Tasks",
        "entity_id": "22fb2a43-b232-581d-b2f5-16be87e41e7a"
      },
      {
        "name": "email_fa",
        "display_name": "seq_id",
        "label": "Email",
        "label_plural": "Emails",
        "entity_id": "d8bbc46b-e064-45f7-bd42-83643e2afbc8"
      },
            {
        "name": "meeting_fa",
        "display_name": "meeting_fa_field0",
        "label": "Meeting",
        "label_plural": "Meetings",
        "entity_id": "bb493580-2db0-4c84-8469-67da484e4633"
      },
      {
        "name": "phone_call_fa",
        "display_name": "seq_id",
        "label": "Phone Call",
        "label_plural": "Phone Calls",
        "entity_id": "8ea07b6f-16ca-49ed-9b2f-d96929b540d0"
      },
      {
        "name": "note_fa",
        "display_name": "seq_id",
        "label": "Note",
        "label_plural": "Notes",
        "entity_id": "898f7649-9406-42d2-8fbe-e2db24337b4b"
      },
      {
        "name": "attachment_fa",
        "display_name": "seq_id",
        "label": "Attachment",
        "label_plural": "Attachments",
        "entity_id": "db72867d-d429-49d0-9546-f5437d3aed18"
      },
      {
        "name": "agent",
        "display_name": "full_name",
        "label": "User",
        "label_plural": "Users",
        "entity_id": "06470721-1125-5abb-b8e8-0d287398c0bd"
      },
      {
        "name": "document_template",
        "display_name": "seq_id",
        "label": "settings.document_template",
        "label_plural": "settings.document_template_plural",
        "entity_id": "386b082f-3bf5-4675-a108-62936fe05fb2"
      },
      {
        "name": "email_template_fa",
        "display_name": "description",
        "label": "Email Template",
        "label_plural": "Email Templates",
        "entity_id": "8b8d526c-abdc-429c-861e-663ac9e57cdc"
      },
      {
        "name": "sms_template_fa",
        "display_name": "description",
        "label": "Text Template",
        "label_plural": "Text Templates",
        "entity_id": "3bb80b42-397a-483f-81f3-8d269fbb114f"
      },
    ]
  }
}
```

</details>
