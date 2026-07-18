export interface TokenProvider {
  getToken(): Promise<string | null>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.fetch(path, options);

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  async requestBlob(
    path: string,
    options: RequestOptions = {},
  ): Promise<Blob> {
    const response = await this.fetch(path, options);
    return response.blob();
  }

  get<T>(
    path: string,
    query?: RequestOptions['query'],
  ): Promise<T> {
    return this.request<T>(path, { method: 'GET', query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  private async fetch(
    path: string,
    options: RequestOptions,
  ): Promise<Response> {
    const token = await this.tokenProvider.getToken();
    const url = new URL(`${this.baseUrl}${path}`);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined && {
          'Content-Type': 'application/json',
        }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(options.body !== undefined && {
        body: JSON.stringify(options.body),
      }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, await this.readError(response));
    }
    return response;
  }

  private async readError(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (Array.isArray(body.message)) {
        return body.message.join('; ');
      }
      return body.message ?? body.error ?? `Request failed (${response.status})`;
    } catch {
      return `Request failed (${response.status})`;
    }
  }
}
