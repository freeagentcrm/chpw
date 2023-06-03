export interface FaConfig {
  client_id: string;
  client_secret: string;
  environment: string;
}

export interface FaAuth {
  method: string;
  token_url: string;
  current_token: string;
  expires_in: number;
  token_type: string;
  headers: Headers;
  grant_type: string;
  expiry_date_time?: number;
}

export interface FaRequest {
  method: string;
  api_url: string;
  headers?: Headers;
}

export interface FaFilter {
  field_name: string;
  operator: string;
  values: [string];
}

export interface FaListEntityValues {
  entity: string;
  id?: string;
  filters?: [FaFilter];
  count?: number;
  order?: [[string]];
}

export interface FaCreateEntity {
  entity: string;
  field_values: object;
}

export interface FaUpdateEntity {
  entity: string;
  id: string;
  field_values: object;
}

export interface FaDeleteEntity {
  entity: string;
  id: string;
}

export async function fa({ client_id, client_secret, environment }: FaConfig) {
  if (client_id || client_secret || environment)
    throw new Error("Invalid config");

  let faAuth: FaAuth = {
    method: "POST",
    current_token: "",
    grant_type: "client_credentials",
    token_url:
      environment === "prod"
        ? `https://freeagent.network/oauth/token`
        : `https://${environment}.freeagent.network/oauth/token`,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    expires_in: 0,
    token_type: "",
  };

  let faRequest: FaRequest = {
    method: "POST",
    api_url:
      environment === "prod"
        ? `https://freeagent.network/api/graphql`
        : `https://${environment}.freeagent.network/api/graphql`,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  };

  async function updateToken() {
    const body = JSON.stringify({
      client_id,
      client_secret,
      grant_type: faAuth.grant_type,
    });

    const response = await fetch(faAuth.token_url, {
      method: faAuth.method,
      headers: faAuth.headers,
      body: body,
    });

    const { access_token, expires_in, token_type } = await response.json();
    faAuth = {
      ...faAuth,
      current_token: access_token,
      expires_in,
      token_type,
      expiry_date_time: Date.now() + expires_in * 1000,
    };
    faRequest = {
      ...faRequest,
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `${token_type} ${access_token}`,
      }),
    };
  }

  async function checkToken() {
    const needNewToken =
      faAuth.expires_in < Date.now() || faAuth.current_token === "";
    if (!needNewToken) {
      return;
    }
    await updateToken();
  }

  await checkToken();

  async function find({
    entity,
    id,
    filters,
    count,
    order,
  }: FaListEntityValues) {
    await checkToken();

    const { method, api_url, headers } = faRequest;

    let variables: { [k: string]: any } = {
      entity,
    };

    if (filters) {
      variables = {
        ...variables,
        filters,
      };
    }
    if (count) {
      variables = {
        ...variables,
        count,
      };
    }
    if ((id && filters) || (id && count)) {
      throw new Error("must provide either just uuid or (filters and count)");
    }

    if (id) {
      variables = {
        ...variables,
        id,
      };
    }
    if (order) {
      variables = {
        ...variables,
        order,
      };
    }

    const body = JSON.stringify({
      query:
        "query listEntityValues($entity: String!, $fields: [String], $order: [[String]], $limit: Int, $offset: Int, $pattern: String, $filters: [Filter]) {\n    listEntityValues(entity: $entity, fields: $fields, order: $order, limit: $limit, offset: $offset, pattern: $pattern, filters: $filters) {\n        count\n        entity_values {\n            id\n            seq_id\n            field_values\n        }\n    }\n}",
      variables,
    });

    const response = await fetch(api_url, {
      method,
      headers,
      body,
    });

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.listEntityValues.entity_values;
  }

  async function create({ entity, field_values }: FaCreateEntity) {
    await checkToken();

    const { method, api_url, headers } = faRequest;

    const body = JSON.stringify({
      query:
        "mutation createEntityValue($entity: String!, $field_values: FieldValues) {\n    createEntityValue(entity: $entity, field_values: $field_values) {\n        id\n        seq_id\n        field_values\n    }\n}",
      variables: {
        entity,
        field_values,
      },
    });

    const response = await fetch(api_url, {
      method,
      headers,
      body,
    });

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.createEntityValue;
  }

  async function update({ entity, id, field_values }: FaUpdateEntity) {
    await checkToken();

    const { method, api_url, headers } = faRequest;

    const body = JSON.stringify({
      query:
        "mutation updateEntityValue($entity: String!, $id: String!, $field_values: FieldValues) {\n    updateEntityValue(entity: $entity, id: $id, field_values: $field_values) {\n        id\n        seq_id\n        field_values\n    }\n}",
      variables: {
        entity,
        id,
        field_values,
      },
    });

    const response = await fetch(api_url, {
      method,
      headers,
      body,
    });

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.updateEntityValue;
  }

  async function remove({ entity, id }: FaDeleteEntity) {
    await checkToken();

    const { method, api_url, headers } = faRequest;

    const body = JSON.stringify({
      query:
        "mutation deleteEntityValue($entity: String!, $id: String!) {\n    deleteEntityValue(entity: $entity, id: $id) {\n        id\n        seq_id\n        field_values\n    }\n}",
      variables: {
        entity,
        id,
      },
    });

    const response = await fetch(api_url, {
      method,
      headers,
      body,
    });

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.deleteEntityValue;
  }

  async function getEntities() {
    await checkToken();

    const { method, api_url, headers } = faRequest;

    const body = JSON.stringify({
      query:
        "query getEntities($alphabetical_order: Boolean) {\n          getEntities(alphabetical_order: $alphabetical_order) { \n              name\n              display_name\n              label\n              label_plural\n              entity_id\n          }\n      }",
      variables: {
        alphabetical_order: true,
      },
    });

    const response = await fetch(api_url, {
      method,
      headers,
      body,
    });

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.getEntities;
  }
}
