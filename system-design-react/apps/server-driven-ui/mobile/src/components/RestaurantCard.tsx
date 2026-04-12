import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SDUIComponentProps } from '../core/types';

export function RestaurantCard({
  name,
  imageUrl,
  rating,
  deliveryTime,
  cuisine,
  priceRange,
  actions,
}: SDUIComponentProps) {
  const navigation = useNavigation<any>();
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <View style={cardStyles.card}>
      <Image
        source={{ uri: imageUrl as string }}
        style={cardStyles.image}
        resizeMode="cover"
      />
      <View style={cardStyles.info}>
        <Text style={cardStyles.name}>{name as string}</Text>
        <View style={cardStyles.meta}>
          <Text style={cardStyles.rating}>{String(rating)}</Text>
          <Text style={cardStyles.metaText}>{deliveryTime as string}</Text>
          <Text style={cardStyles.metaText}>{cuisine as string}</Text>
          <Text style={cardStyles.metaText}>{priceRange as string}</Text>
        </View>
      </View>
    </View>
  );

  if (navigateAction) {
    const to = navigateAction.payload.to as string;
    const restaurantId = to.split('/').pop();
    return (
      <Pressable
        onPress={() => navigation.navigate('Restaurant', { id: restaurantId })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const cardStyles = StyleSheet.create({
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
    height: 150,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rating: {
    fontWeight: '600',
    color: '#f59e0b',
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
});
