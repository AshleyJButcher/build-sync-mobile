import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProducts, useUpdateProduct, useDeleteProduct } from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../src/lib/currency';
import { EditProductModal } from '../../src/components/EditProductModal';

const GREEN_PRIMARY = '#4CAF50';

export default function ProductDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: products } = useProducts(null);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const product = products?.find((p) => p.id === id);

  const { user } = useAuth();
  const isBuilder = role === 'builder' || role === 'administrator';
  const canEdit = isBuilder || product?.added_by === user?.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return GREEN_PRIMARY;
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const handleApprove = async () => {
    if (!product) return;
    Alert.alert(
      'Approve Product',
      'Are you sure you want to approve this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await updateProduct.mutateAsync({
                id: product.id,
                status: 'approved',
              });
              Alert.alert('Success', 'Product approved');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve product');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!product) return;
    Alert.alert(
      'Reject Product',
      'Are you sure you want to reject this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProduct.mutateAsync({
                id: product.id,
                status: 'rejected',
              });
              Alert.alert('Success', 'Product rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject product');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!product) return;
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync({
                id: product.id,
                projectId: product.project_id,
                name: product.name,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (!product) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="body"
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading product...
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(product.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Product Details
        </Text>
        {canEdit && (
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image */}
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.colors.muted },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Text
              variant="caption"
              style={[styles.statusText, { color: statusColor }]}
            >
              {product.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text
            variant="caption"
            style={[styles.category, { color: theme.colors.textSecondary }]}
          >
            {product.category.toUpperCase()}
          </Text>
          <Text variant="headingLarge" style={[styles.productName, { color: theme.colors.text }]}>
            {product.name}
          </Text>

          {product.price && (
            <Text
              variant="headingMedium"
              style={[styles.price, { color: GREEN_PRIMARY }]}
            >
              {formatCurrency(product.price)}
            </Text>
          )}

          {product.description && (
            <Text
              variant="body"
              style={[styles.description, { color: theme.colors.textSecondary }]}
            >
              {product.description}
            </Text>
          )}
        </View>

        {/* Actions */}
        {isBuilder && product.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={updateProduct.isPending}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={updateProduct.isPending}
            >
              <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {canEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteProduct.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text
              variant="body"
              style={[styles.deleteButtonText, { color: theme.colors.error }]}
            >
              Delete Product
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditProductModal
        visible={showEditModal}
        product={product}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    gap: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: GREEN_PRIMARY,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
});
