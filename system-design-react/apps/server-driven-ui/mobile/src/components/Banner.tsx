import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SDUIComponentProps } from '../core/types';

export function Banner({ imageUrl, title, subtitle, actions }: SDUIComponentProps) {
  const navigation = useNavigation<any>();
  const navigateAction = actions?.find((a) => a.type === 'navigate');

  const content = (
    <View style={bannerStyles.container}>
      <Image
        source={{ uri: imageUrl as string }}
        style={bannerStyles.image}
        resizeMode="cover"
      />
      <View style={bannerStyles.overlay}>
        <Text style={bannerStyles.title}>{title as string}</Text>
        {subtitle && (
          <Text style={bannerStyles.subtitle}>{subtitle as string}</Text>
        )}
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

const bannerStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
});
