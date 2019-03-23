import { gt, lt } from 'semver';
import { MastodonError } from '../errors/mastodon-error';
import { Mastodon } from './mastodon';

type Decorator = (
  mastodon: Mastodon,
  name: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
) => void;

export const requiresAuthentication: Decorator = (
  mastodon,
  name,
  descriptor,
) => {
  const original = descriptor.value;
  if (!original) return;

  descriptor.value = (...args: any[]) => {
    if (!mastodon.token) {
      throw new MastodonError(
        'MastodonError',
        `${name} requires authentication`,
      );
    }

    return original(...args);
  };
};

interface AvailabeParams {
  since?: string;
  until?: string;
}

export const available = (parameters: AvailabeParams): Decorator => (
  mastodon,
  name,
  descriptor,
) => {
  const original = descriptor.value;
  if (!original) return;

  const { since, until } = parameters;

  descriptor.value = (...args: any[]) => {
    if (since && lt(since, mastodon.version)) {
      throw new MastodonError(
        'MastodonVersionError',
        `${name} is not compatible with current Mastodon version ${
          mastodon.version
        }`,
      );
    }

    if (until && gt(until, mastodon.version)) {
      throw new MastodonError(
        'MastodonVersionError',
        `${name} is not compatible with current Mastodon version ${
          mastodon.version
        }`,
      );
    }

    return original(...args);
  };
};