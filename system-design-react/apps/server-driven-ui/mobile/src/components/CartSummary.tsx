import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartContext } from '../CartContext';

export function CartSummary() {
  const { items, total } = useContext(CartContext);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <View style={cartStyles.summary}>
      <View style={cartStyles.countBadge}>
        <Text style={cartStyles.countText}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Text style={cartStyles.total}>${total.toFixed(2)}</Text>
    </View>
  );
}

const cartStyles = StyleSheet.create({
  summary: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  countText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  total: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
