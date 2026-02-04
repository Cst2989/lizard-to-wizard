<template>
  <div class="form-container">
    <div class="title">Contact Form</div>
    <div class="form-description">
      Fill out this form to contact us.
    </div>

    <div v-if="submitSuccess" class="success-message">
      <strong>Success!</strong> Your form has been submitted successfully.
    </div>

    <div v-if="hasErrors && attemptedSubmit" class="form-errors">
      <div class="error-title">Please correct the following errors:</div>
      <div v-for="error in errorMessages" :key="error">{{ error }}</div>
    </div>

    <form @submit.prevent="handleSubmit" :class="{ loading: isSubmitting }">
      
      <div class="form-group">
        <div class="label-text">Full Name *</div>
        <input 
          type="text" 
          v-model="form.name"
          :class="{ 'input-error': errors.name }"
          placeholder="Enter your name"
          @blur="validateField('name')"
        >
        <div class="hint">Enter your full name as it appears on official documents</div>
        <div v-if="errors.name" class="error-message">
          {{ errors.name }}
        </div>
      </div>

      <div class="form-group">
        <div class="label-text">Email Address *</div>
        <input 
          type="text"
          v-model="form.email"
          :class="{ 'input-error': errors.email }"
          placeholder="Enter your email"
          @blur="validateField('email')"
        >
        <div class="hint">We'll use this to send you a confirmation</div>
        <div v-if="errors.email" class="error-message">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <div class="label-text">Phone Number</div>
        <input 
          type="text" 
          v-model="form.phone"
          :class="{ 'input-error': errors.phone }"
          placeholder="Enter phone number"
          @blur="validateField('phone')"
        >
        <div class="hint">Optional. Include area code (e.g., +1-555-123-4567)</div>
        <div v-if="errors.phone" class="error-message">
          {{ errors.phone }}
        </div>
      </div>

      <div class="form-group">
        <div class="label-text">Subject *</div>
        <select 
          v-model="form.subject"
          :class="{ 'input-error': errors.subject }"
          @change="validateField('subject')"
        >
          <option value="">Please select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="billing">Billing Question</option>
          <option value="feedback">Feedback</option>
        </select>
        <div class="hint">Choose the category that best describes your inquiry</div>
        <div v-if="errors.subject" class="error-message">
          {{ errors.subject }}
        </div>
      </div>

      <div class="form-group">
        <div class="label-text">Priority Level</div>
        <div class="radio-group">
          <div class="radio-item">
            <input type="radio" name="priority" value="low" v-model="form.priority" @change="validateField('priority')">
            <span>Low - General question</span>
          </div>
          <div class="radio-item">
            <input type="radio" name="priority" value="medium" v-model="form.priority" @change="validateField('priority')">
            <span>Medium - Need response within 2-3 days</span>
          </div>
          <div class="radio-item">
            <input type="radio" name="priority" value="high" v-model="form.priority" @change="validateField('priority')">
            <span>High - Urgent, need immediate attention</span>
          </div>
        </div>
        <div class="hint">Select the urgency level for your request</div>
        <div v-if="errors.priority" class="error-message">
          {{ errors.priority }}
        </div>
      </div>

      <div class="form-group">
        <div class="label-text">Message *</div>
        <textarea 
          v-model="form.message"
          :class="{ 'input-error': errors.message }"
          placeholder="Type your message here..."
          rows="5"
          @blur="validateField('message')"
        ></textarea>
        <div class="hint">
          Describe your inquiry in detail. {{ 1000 - form.message.length }} characters remaining.
        </div>
        <div v-if="errors.message" class="error-message">
          {{ errors.message }}
        </div>
      </div>

      <div class="form-group">
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" v-model="form.newsletter">
            <span>Subscribe to our newsletter</span>
          </div>
        </div>
        <div class="hint">Receive updates about our products and services</div>
      </div>

      <div class="form-group">
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="form.terms"
              :class="{ 'input-error': errors.terms }"
              @change="validateField('terms')"
            >
            <span>I agree to the Terms of Service *</span>
          </div>
        </div>
        <div class="hint">Required to submit this form</div>
        <div v-if="errors.terms" class="error-message">
          {{ errors.terms }}
        </div>
      </div>

      <div 
        class="submit-btn"
        :class="{ disabled: isSubmitting }"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue'

export default {
  name: 'InaccessibleForm',
  setup() {
    const form = reactive({
      name: '',
      email: '',
      phone: '',
      subject: '',
      priority: '',
      message: '',
      newsletter: false,
      terms: false
    })

    const errors = reactive({})
    const isSubmitting = ref(false)
    const submitSuccess = ref(false)
    const attemptedSubmit = ref(false)

    const hasErrors = computed(() => {
      return Object.keys(errors).some(key => errors[key])
    })

    const errorMessages = computed(() => {
      const messages = []
      if (errors.name) messages.push(`Name: ${errors.name}`)
      if (errors.email) messages.push(`Email: ${errors.email}`)
      if (errors.phone) messages.push(`Phone: ${errors.phone}`)
      if (errors.subject) messages.push(`Subject: ${errors.subject}`)
      if (errors.priority) messages.push(`Priority: ${errors.priority}`)
      if (errors.message) messages.push(`Message: ${errors.message}`)
      if (errors.terms) messages.push(`Terms: ${errors.terms}`)
      return messages
    })

    const validateField = (field) => {
      delete errors[field]

      switch (field) {
        case 'name':
          if (!form.name.trim()) {
            errors.name = 'Name is required'
          } else if (form.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long'
          }
          break

        case 'email':
          if (!form.email.trim()) {
            errors.email = 'Email is required'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Please enter a valid email address'
          }
          break

        case 'phone':
          if (form.phone.trim() && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(form.phone)) {
            errors.phone = 'Please enter a valid phone number'
          }
          break

        case 'subject':
          if (!form.subject) {
            errors.subject = 'Please select a subject'
          }
          break

        case 'priority':
          if (!form.priority) {
            errors.priority = 'Please select a priority level'
          }
          break

        case 'message':
          if (!form.message.trim()) {
            errors.message = 'Message is required'
          } else if (form.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long'
          }
          break

        case 'terms':
          if (!form.terms) {
            errors.terms = 'You must agree to the terms of service'
          }
          break
      }
    }

    const validateForm = () => {
      const fields = ['name', 'email', 'phone', 'subject', 'priority', 'message', 'terms']
      fields.forEach(field => validateField(field))
      return !hasErrors.value
    }

    const handleSubmit = async () => {
      attemptedSubmit.value = true
      
      if (!validateForm()) {
        return
      }

      isSubmitting.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        submitSuccess.value = true
        attemptedSubmit.value = false
        
        Object.keys(form).forEach(key => {
          if (typeof form[key] === 'boolean') {
            form[key] = false
          } else {
            form[key] = ''
          }
        })
        
        Object.keys(errors).forEach(key => delete errors[key])
        
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      form,
      errors,
      isSubmitting,
      submitSuccess,
      attemptedSubmit,
      hasErrors,
      errorMessages,
      validateField,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label-text {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: white;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.input-error {
  border-color: #e74c3c;
}

.input-error:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.hint {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.form-errors {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.error-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-item,
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input[type="radio"],
input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.submit-btn:hover:not(.disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.submit-btn.disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.loading {
  opacity: 0.7;
}

@media (max-width: 600px) {
  .form-container {
    padding: 1rem;
  }
}
</style>
