import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';

export function ListLayout({ children }: SDUIComponentProps) {
  return <View style={listStyles.container}>{children}</View>;
}

const listStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});
