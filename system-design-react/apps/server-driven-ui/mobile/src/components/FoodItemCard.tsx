import React, { useContext } from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import type { SDUIComponentProps } from '../core/types';
import { CartContext } from '../CartContext';

export function FoodItemCard({
  name,
  description,
  price,
  imageUrl,
  actions,
}: SDUIComponentProps) {
  const { addItem } = useContext(CartContext);
  const addToCartAction = actions?.find((a) => a.type === 'add-to-cart');

  function handleAddToCart() {
    if (!addToCartAction) return;
    addItem({
      itemId: addToCartAction.payload.itemId as string,
      name: name as string,
      price: addToCartAction.payload.price as number,
      quantity: 1,
    });
  }

  return (
    <View style={foodStyles.card}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl as string }}
          style={foodStyles.image}
          resizeMode="cover"
        />
      )}
      <View style={foodStyles.info}>
        <Text style={foodStyles.name}>{name as string}</Text>
        {description && (
          <Text style={foodStyles.description}>{description as string}</Text>
        )}
        <View style={foodStyles.footer}>
          <Text style={foodStyles.price}>
            ${(price as number).toFixed(2)}
          </Text>
          {addToCartAction && (
            <Pressable style={foodStyles.addButton} onPress={handleAddToCart}>
              <Text style={foodStyles.addButtonText}>Add to Cart</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const foodStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
