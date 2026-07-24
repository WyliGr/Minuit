import { ToggleButton } from '@astryxdesign/core/ToggleButton';
import { ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import { Button } from '@astryxdesign/core/Button';
import { HStack, StackItem } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import type { TheaterListItem } from '../lib/types';

interface TheaterFilterBarProps {
  theaters: TheaterListItem[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  isDisabled?: boolean;
}

export function TheaterFilterBar({
  theaters,
  selected,
  onChange,
  isDisabled,
}: TheaterFilterBarProps) {
  const allSelected = selected.size === 0;
  const noneSelected = selected.size > 0;

  const value = [...selected];
  const handleChange = (v: string | null | string[]) => {
    if (v === null) {
      onChange(new Set());
    } else if (Array.isArray(v)) {
      onChange(new Set(v));
    }
  };

  return (
    <HStack gap={2} wrap="wrap" vAlign="center" hAlign="start">
      <Text type="label" color="secondary" weight="medium">
        Salles
      </Text>
      <ToggleButtonGroup
        label="Filtrer les salles"
        type="multiple"
        value={value}
        onChange={handleChange}
        size="sm"
        isDisabled={isDisabled}
      >
        {theaters.map((t) => (
          <ToggleButton key={t.slug} value={t.slug} label={t.name}>
            {t.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <StackItem size="static">
        <HStack gap={1} vAlign="center">
          <Button
            variant="ghost"
            size="sm"
            label="Tout"
            isDisabled={allSelected || isDisabled}
            onClick={() => onChange(new Set())}
          />
          <Button
            variant="ghost"
            size="sm"
            label="Aucun"
            isDisabled={!noneSelected || isDisabled}
            onClick={() => onChange(new Set(theaters.map((t) => t.slug)))}
          />
        </HStack>
      </StackItem>
    </HStack>
  );
}