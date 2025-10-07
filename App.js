import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';

// Initial sample tickets
const initialTickets = [
  {
    id: '1',
    title: 'Fix login bug',
    description: 'Users cannot log in with special characters',
    status: 'Under Assistance',
    rating: null
  },
  {
    id: '2',
    title: 'Update homepage design',
    description: 'Redesign the landing page layout',
    status: 'Created',
    rating: null
  },
  {
    id: '3',
    title: 'Database optimization',
    description: 'Improve query performance',
    status: 'Completed',
    rating: 4
  }
];

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Created':
        return { backgroundColor: '#A0826D', color: '#FFFFFF' };
      case 'Under Assistance':
        return { backgroundColor: '#D4A574', color: '#3E2723' };
      case 'Completed':
        return { backgroundColor: '#8B7355', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#6B5744', color: '#FFFFFF' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.statusText, { color: statusStyle.color }]}>
        {status}
      </Text>
    </View>
  );
};

// RatingStars Component
const RatingStars = ({ rating, onRate, editable = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.ratingContainer}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => editable && onRate(star)}
          disabled={!editable}
        >
          <Text style={styles.star}>
            {rating >= star ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// TicketItem Component
const TicketItem = ({ ticket, onEdit, onDelete, onRate }) => {
  return (
    <View style={styles.ticketItem}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>{ticket.title}</Text>
        <View style={styles.ticketActions}>
          <TouchableOpacity onPress={() => onEdit(ticket)} style={styles.iconButton}>
            <Text style={styles.iconText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(ticket.id)} style={styles.iconButton}>
            <Text style={styles.iconText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.ticketDescription}>{ticket.description}</Text>
      
      <View style={styles.ticketFooter}>
        <StatusBadge status={ticket.status} />
        {ticket.status === 'Completed' && (
          <RatingStars 
            rating={ticket.rating} 
            onRate={(rating) => onRate(ticket.id, rating)}
            editable={true}
          />
        )}
      </View>
    </View>
  );
};

// Main App Component
export default function App() {
  const [tickets, setTickets] = useState(initialTickets);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Created'
  });

  const handleAddTicket = () => {
    setEditingTicket(null);
    setFormData({ title: '', description: '', status: 'Created' });
    setModalVisible(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status
    });
    setModalVisible(true);
  };

  const handleSaveTicket = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingTicket) {
      setTickets(tickets.map(ticket =>
        ticket.id === editingTicket.id
          ? { ...ticket, ...formData, rating: formData.status !== 'Completed' ? null : ticket.rating }
          : ticket
      ));
    } else {
      const newTicket = {
        id: Date.now().toString(),
        ...formData,
        rating: null
      };
      setTickets([...tickets, newTicket]);
    }

    setModalVisible(false);
    setFormData({ title: '', description: '', status: 'Created' });
  };

  const handleDeleteTicket = (id) => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTickets(tickets.filter(ticket => ticket.id !== id))
        }
      ]
    );
  };

  const handleRateTicket = (id, rating) => {
    setTickets(tickets.map(ticket =>
      ticket.id === id ? { ...ticket, rating } : ticket
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TICKET TRACKER</Text>
        <View style={styles.headerLine} />
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TicketItem
            ticket={item}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onRate={handleRateTicket}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddTicket}
      >
        <Text style={styles.addButtonText}>+ NEW TICKET</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTicket ? 'EDIT TICKET' : 'NEW TICKET'}
            </Text>
            <View style={styles.divider} />

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#A0826D"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#A0826D"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>STATUS</Text>
            <View style={styles.statusPicker}>
              {['Created', 'Under Assistance', 'Completed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.statusOptionActive
                  ]}
                  onPress={() => setFormData({ ...formData, status })}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      formData.status === status && styles.statusOptionTextActive
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTicket}
              >
                <Text style={styles.saveButtonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1ED',
  },
  header: {
    backgroundColor: '#3E2723',
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F5F1ED',
    letterSpacing: 3,
  },
  headerLine: {
    width: 60,
    height: 2,
    backgroundColor: '#D4A574',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D4A574',
    borderRadius: 0,
    padding: 20,
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E2723',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F1ED',
    borderWidth: 1,
    borderColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#3E2723',
    fontWeight: '400',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6B5744',
    marginBottom: 16,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
    color: '#C67F2E',
    marginHorizontal: 2,
  },
  addButton: {
    backgroundColor: '#8B7355',
    margin: 16,
    padding: 18,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B5744',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(62, 39, 35, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF8F3',
    borderWidth: 3,
    borderColor: '#8B7355',
    borderRadius: 0,
    padding: 28,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3E2723',
    letterSpacing: 2,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#D4A574',
    marginVertical: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D4A574',
    borderRadius: 0,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#3E2723',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E2723',
    marginBottom: 12,
    letterSpacing: 2,
  },
  statusPicker: {
    marginBottom: 24,
    gap: 10,
  },
  statusOption: {
    padding: 14,
    borderWidth: 2,
    borderColor: '#D4A574',
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
  },
  statusOptionActive: {
    backgroundColor: '#8B7355',
    borderColor: '#6B5744',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#3E2723',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#8B7355',
  },
  cancelButtonText: {
    color: '#3E2723',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  saveButton: {
    backgroundColor: '#8B7355',
    borderColor: '#6B5744',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
});