import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';

export function GridLayout({ columns = 2, children }: SDUIComponentProps) {
  const childArray = React.Children.toArray(children);
  const numColumns = Number(columns);

  return (
    <View style={gridStyles.container}>
      {childArray.map((child, index) => (
        <View
          key={index}
          style={[
            gridStyles.item,
            { width: `${100 / numColumns}%` as unknown as number },
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  item: {
    padding: 8,
  },
});
