import { createContext, useCallback, useContext, useLayoutEffect } from "react";

interface UnsavedChangesContextValue {
  register: (isSaving: boolean) => () => void;
  requestDiscard: (discard: () => void) => void;
}

export const UnsavedChangesContext =
  createContext<UnsavedChangesContextValue | null>(null);

export function useUnsavedChanges(hasChanges: boolean, isSaving: boolean) {
  const guard = useContext(UnsavedChangesContext);

  useLayoutEffect(() => {
    if (hasChanges || isSaving) {
      return guard?.register(isSaving);
    }
  }, [guard, hasChanges, isSaving]);

  return guard?.requestDiscard;
}

export function useFormClose(
  onClose: () => void,
  hasChanges: boolean,
  isSaving: boolean
) {
  const requestDiscard = useUnsavedChanges(hasChanges, isSaving);

  return useCallback(() => {
    if (isSaving) {
      return;
    }
    if (hasChanges && requestDiscard) {
      requestDiscard(onClose);
      return;
    }
    onClose();
  }, [hasChanges, isSaving, onClose, requestDiscard]);
}

export function hasFieldChanges<Values extends object>(
  values: Values,
  initialValues: Values
) {
  return (Object.keys(initialValues) as (keyof Values)[]).some(
    (key) => values[key] !== initialValues[key]
  );
}
