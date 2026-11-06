import {
  validate,
  type PathKind,
  type SchemaPath,
  type SchemaPathRules,
} from '@angular/forms/signals';

export const BLANK_KIND = 'blank';
export const EMAIL_TLD_KIND = 'emailTld';
export const isOnlyWhitespace = (value: string): boolean =>
  value.length > 0 && value.trim().length === 0;

export const isMissingEmailTld = (value: string): boolean => {
  const at = value.lastIndexOf('@');
  if (at < 0) {
    return false;
  }
  return !/\.[a-z]{2,}$/i.test(value.slice(at + 1));
};

export function notBlank<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  config: { readonly message: () => string },
): void {
  validate(path, (ctx) =>
    isOnlyWhitespace(ctx.value()) ? { kind: BLANK_KIND, message: config.message() } : undefined,
  );
}

export function emailTld<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  config: { readonly message: () => string },
): void {
  validate(path, (ctx) =>
    isMissingEmailTld(ctx.value())
      ? { kind: EMAIL_TLD_KIND, message: config.message() }
      : undefined,
  );
}
