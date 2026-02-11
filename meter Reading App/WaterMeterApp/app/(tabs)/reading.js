import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// ✅ 1. Safe Area එක Import කරගන්න (react-native එකෙන් නෙවෙයි, මේකෙන් ගන්න)
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://10.10.35.59:3000/api'; 

export default function ReadingScreen() {
  const router = useRouter();
  
  // ... (State Variables සහ Functions ටික එහෙමම තියන්න - වෙනසක් නෑ) ...
  // (කලින් කෝඩ් එකේ තිබුණ searchCustomer, submitData ආදිය මෙතන තියෙනවා කියලා හිතන්න)

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState(null);
  const [currentReading, setCurrentReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [sabhaSuffix, setSabhaSuffix] = useState('');

  const today = new Date();
  const selectedMonth = today.getMonth() + 1;
  const selectedYear = today.getFullYear();
  const readingDate = today.toISOString().split('T')[0];

  useEffect(() => {
    fetchUserDataAndProjects();
  }, []);

  const fetchUserDataAndProjects = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      if (jsonValue != null) {
        const user = JSON.parse(jsonValue);
        setUserData(user);
        const suffix = String(user.sabha).slice(-3);
        setSabhaSuffix(suffix);
        fetchProjects(user.sabha);
      }
    } catch (e) {
      console.error("Error loading data", e);
    }
  };

  const fetchProjects = async (sabhaCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/water-project-list/${sabhaCode}`);
      setProjects(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load projects");
    }
  };

  const searchCustomer = async () => {
    if (!selectedProject) {
      Alert.alert("Error", "Please select a Project Code first");
      return;
    }
    if (!searchQuery) {
      Alert.alert("Error", "Please enter Bill Number part");
      return;
    }

    setLoading(true);
    setCustomer(null);
    setCurrentReading('');
    Keyboard.dismiss(); 

    try {
      const response = await axios.get(`${API_BASE_URL}/water-readings/pending-customers`, {
        params: {
          sabha_code: userData.sabha,
          project_code: selectedProject,
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data.status === 'success') {
        const allCustomers = response.data.data;
        
        const foundCustomer = allCustomers.find(c => {
          const billNo = c.bill_number_ref.toLowerCase(); 
          const userText = searchQuery.toLowerCase();    

          if (billNo.endsWith(userText)) return true;
          if (billNo.includes(userText)) return true;

          return false;
        });

        if (foundCustomer) {
          setCustomer({
            ...foundCustomer,
            last_reading: foundCustomer.last_reading || 0
          });
        } else {
          Alert.alert("Not Found", "Customer not found. Try entering just the Serial Number (e.g., 001)");
        }
      } else {
        Alert.alert("Error", "Failed to fetch customer list");
      }
    } catch (error) {
      console.error("Search Error", error);
      Alert.alert("Error", "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSubmit = () => {
    if (!currentReading) {
      Alert.alert("Error", "Please enter current reading");
      return;
    }
    const current = Number(currentReading);
    const previous = Number(customer.last_reading);
    if (current < previous) {
      Alert.alert("Invalid Reading", `Current reading (${current}) cannot be less than previous reading (${previous}).`);
      return;
    }
    Alert.alert(
      "Verify Reading",
      `Previous: ${previous}\nCurrent: ${current}\n\nConfirm to save?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: submitData } 
      ]
    );
  };

  const submitData = async () => {
    setLoading(true);
    try {
      const readerID = userData ? userData.nic : "MobileApp";
      const payloadItem = {
        account_id: customer.account_id,
        bill_number_ref: customer.bill_number_ref,
        sabha_code: customer.sabha_code,
        project_code: customer.project_code,
        reading_date: readingDate,
        year: selectedYear,
        month: selectedMonth,
        previous_reading: Number(customer.last_reading),
        current_reading: Number(currentReading),
        reader_id: readerID,
        reading_source: 'MobileApp'
      };
      const response = await axios.post(`${API_BASE_URL}/water-readings/batch`, [payloadItem]);
      if (response.data.status === 'success') {
        Alert.alert("Success", "Reading Saved!");
        setCustomer(null);
        setSearchQuery('');
        setCurrentReading('');
      } else {
        Alert.alert("Error", "Failed to save data");
      }
    } catch (error) {
      console.error("Submit Error", error);
      Alert.alert("Error", "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ 2. ScrollView එක SafeAreaView එක ඇතුලට දාන්න
    // flex: 1 දැම්මේ නැත්නම් Screen එක පේන්නේ නැති වෙයි.
    // backgroundColor දැම්මේ උඩ සහ යට margin වල පාට වෙනස් නොවී තියෙන්න.
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* --- Section 1: Filter (Project) --- */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Project</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProject}
              onValueChange={(itemValue) => {
                  setSelectedProject(itemValue);
                  setCustomer(null);
                  setSearchQuery('');
              }}
            >
              <Picker.Item label="-- Select Project --" value="" />
              {projects.map((proj) => (
                <Picker.Item 
                  key={proj.code} 
                  label={`${proj.code} - ${proj.name}`} 
                  value={proj.code} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* --- Section 2: SMART SEARCH --- */}
        <View style={styles.card}>
          <Text style={styles.label}>Search Customer</Text>
          
          <View style={styles.searchRow}>
              <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>
                      {sabhaSuffix}{selectedProject ? selectedProject : 'PROJ'}
                  </Text>
              </View>

              <TextInput 
                  style={styles.searchInput} 
                  placeholder="Ex: 001 or 1" 
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  keyboardType="default"
              />
          </View>
          <Text style={styles.hintText}>* Type number (1) OR Serial (001)</Text>

          <TouchableOpacity style={styles.button} onPress={searchCustomer} disabled={loading}>
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SEARCH</Text>}
          </TouchableOpacity>
        </View>

        {/* --- Section 3: Details & Input --- */}
        {customer && (
          <View style={styles.resultCard}>
            <Text style={styles.headerTitle}>Customer Details</Text>
            
            <View style={styles.row}>
              <Text style={styles.key}>Name:</Text>
              <Text style={styles.value}>{customer.full_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.key}>Bill No:</Text>
              <Text style={styles.value}>{customer.bill_number_ref}</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.readingRow}>
               <View>
                  <Text style={styles.readingLabel}>Previous</Text>
                  <Text style={styles.prevValue}>{customer.last_reading}</Text>
               </View>
               <View>
                  <Text style={styles.readingLabel}>Current</Text>
                  <TextInput 
                    style={styles.readingInput} 
                    placeholder="0" 
                    keyboardType="numeric"
                    value={currentReading}
                    onChangeText={setCurrentReading}
                  />
               </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleVerifyAndSubmit} disabled={loading}>
               {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>VERIFY & SUBMIT</Text>}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ 3. container එකේ උඩ padding එක අඩු කරන්න පුළුවන් දැන් (SafeArea එකෙන් ඉඩ එන නිසා)
  container: { padding: 15, backgroundColor: '#f4f4f4', flexGrow: 1 },
  
  // ... අනිත් styles ටික එහෙමම තියන්න ...
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 4,
    borderTopWidth: 4,
    borderTopColor: '#58071b'
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#58071b', marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9'
  },
  searchRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 5,
  },
  prefixBox: {
    backgroundColor: '#e0e0e0', 
    padding: 12,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRightWidth: 0, 
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  prefixText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 16
  },
  searchInput: {
    flex: 1, 
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff'
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  button: {
    backgroundColor: '#58071b',
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5
  },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#58071b', marginBottom: 15, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  key: { color: '#666', fontSize: 15 },
  value: { fontWeight: 'bold', fontSize: 15, color: '#333', maxWidth: '70%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fefefe',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  readingLabel: { fontSize: 14, color: '#888', marginBottom: 5, textAlign: 'center' },
  prevValue: { fontSize: 22, fontWeight: 'bold', color: '#555', textAlign: 'center', padding: 5 },
  readingInput: { 
    borderWidth: 2, 
    borderColor: '#58071b', 
    borderRadius: 5, 
    padding: 8, 
    width: 120, 
    textAlign: 'center', 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#000'
  }
});