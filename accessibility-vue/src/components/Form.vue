<template>
  <div class="form-container">
    <h1>Accessible Contact Form</h1>
    <p class="form-description">
      This form demonstrates accessibility best practices including proper labeling, 
      error handling, ARIA attributes, and keyboard navigation support.
    </p>

    <!-- Success Message -->
    <div v-if="submitSuccess" class="success-message" role="alert" aria-live="polite">
      <strong>Success!</strong> Your form has been submitted successfully.
    </div>

    <!-- Form Errors Summary -->
    <div v-if="hasErrors && attemptedSubmit" class="form-errors" role="alert" aria-live="polite">
      <h3 id="error-summary">Please correct the following errors:</h3>
      <ul aria-labelledby="error-summary">
        <li v-for="error in errorMessages" :key="error">{{ error }}</li>
      </ul>
    </div>

    <form @submit.prevent="handleSubmit" :class="{ loading: isSubmitting }" novalidate>
      
      <!-- Name Field -->
      <div class="form-group">
        <label for="name" class="required">Full Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="form.name"
          :class="{ 'input-error': errors.name }"
          :aria-describedby="errors.name ? 'name-error name-hint' : 'name-hint'"
          :aria-invalid="errors.name ? 'true' : 'false'"
          required
          autocomplete="name"
          @blur="validateField('name')"
        >
        <div id="name-hint" class="hint">Enter your full name as it appears on official documents</div>
        <div v-if="errors.name" id="name-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.name }}
        </div>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="required">Email Address</label>
        <input 
          type="email" 
          id="email" 
          v-model="form.email"
          :class="{ 'input-error': errors.email }"
          :aria-describedby="errors.email ? 'email-error email-hint' : 'email-hint'"
          :aria-invalid="errors.email ? 'true' : 'false'"
          required
          autocomplete="email"
          @blur="validateField('email')"
        >
        <div id="email-hint" class="hint">We'll use this to send you a confirmation</div>
        <div v-if="errors.email" id="email-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.email }}
        </div>
      </div>

      <!-- Phone Field -->
      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="form.phone"
          :class="{ 'input-error': errors.phone }"
          :aria-describedby="errors.phone ? 'phone-error phone-hint' : 'phone-hint'"
          :aria-invalid="errors.phone ? 'true' : 'false'"
          autocomplete="tel"
          @blur="validateField('phone')"
        >
        <div id="phone-hint" class="hint">Optional. Include area code (e.g., +1-555-123-4567)</div>
        <div v-if="errors.phone" id="phone-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.phone }}
        </div>
      </div>

      <!-- Subject Field -->
      <div class="form-group">
        <label for="subject" class="required">Subject</label>
        <select 
          id="subject" 
          v-model="form.subject"
          :class="{ 'input-error': errors.subject }"
          :aria-describedby="errors.subject ? 'subject-error subject-hint' : 'subject-hint'"
          :aria-invalid="errors.subject ? 'true' : 'false'"
          required
          @change="validateField('subject')"
        >
          <option value="">Please select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="billing">Billing Question</option>
          <option value="feedback">Feedback</option>
        </select>
        <div id="subject-hint" class="hint">Choose the category that best describes your inquiry</div>
        <div v-if="errors.subject" id="subject-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.subject }}
        </div>
      </div>

      <!-- Priority Radio Group -->
      <fieldset class="fieldset">
        <legend class="legend">Priority Level</legend>
        <div class="radio-group" role="radiogroup" :aria-describedby="errors.priority ? 'priority-error priority-hint' : 'priority-hint'">
          <div class="radio-item">
            <input type="radio" id="priority-low" value="low" v-model="form.priority" @change="validateField('priority')">
            <label for="priority-low">Low - General question</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="priority-medium" value="medium" v-model="form.priority" @change="validateField('priority')">
            <label for="priority-medium">Medium - Need response within 2-3 days</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="priority-high" value="high" v-model="form.priority" @change="validateField('priority')">
            <label for="priority-high">High - Urgent, need immediate attention</label>
          </div>
        </div>
        <div id="priority-hint" class="hint">Select the urgency level for your request</div>
        <div v-if="errors.priority" id="priority-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.priority }}
        </div>
      </fieldset>

      <!-- Message Field -->
      <div class="form-group">
        <label for="message" class="required">Message</label>
        <textarea 
          id="message" 
          v-model="form.message"
          :class="{ 'input-error': errors.message }"
          :aria-describedby="errors.message ? 'message-error message-hint' : 'message-hint'"
          :aria-invalid="errors.message ? 'true' : 'false'"
          required
          rows="5"
          maxlength="1000"
          @blur="validateField('message')"
        ></textarea>
        <div id="message-hint" class="hint">
          Describe your inquiry in detail. {{ 1000 - form.message.length }} characters remaining.
        </div>
        <div v-if="errors.message" id="message-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.message }}
        </div>
      </div>

      <!-- Newsletter Checkbox -->
      <div class="form-group">
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="newsletter" 
              v-model="form.newsletter"
              aria-describedby="newsletter-hint"
            >
            <label for="newsletter">Subscribe to our newsletter</label>
          </div>
        </div>
        <div id="newsletter-hint" class="hint">Receive updates about our products and services</div>
      </div>

      <!-- Terms Checkbox -->
      <div class="form-group">
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="form.terms"
              :class="{ 'input-error': errors.terms }"
              :aria-describedby="errors.terms ? 'terms-error terms-hint' : 'terms-hint'"
              :aria-invalid="errors.terms ? 'true' : 'false'"
              required
              @change="validateField('terms')"
            >
            <label for="terms" class="required">I agree to the Terms of Service</label>
          </div>
        </div>
        <div id="terms-hint" class="hint">Required to submit this form</div>
        <div v-if="errors.terms" id="terms-error" class="error-message" role="alert">
          <span class="error-icon" aria-hidden="true"></span>
          {{ errors.terms }}
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="submit-btn"
        :disabled="isSubmitting"
        :aria-describedby="isSubmitting ? 'submit-status' : null"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
      </button>
      
      <!-- Screen reader status for submit -->
      <div v-if="isSubmitting" id="submit-status" class="sr-only" aria-live="polite">
        Form is being submitted, please wait.
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, ref, computed, nextTick } from 'vue'

export default {
  name: 'AccessibleForm',
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
      // Clear previous error
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
        // Focus on first error field for keyboard users
        await nextTick()
        const firstErrorField = document.querySelector('.input-error, input[aria-invalid="true"]')
        if (firstErrorField) {
          firstErrorField.focus()
        }
        return
      }

      isSubmitting.value = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        submitSuccess.value = true
        attemptedSubmit.value = false
        
        // Reset form
        Object.keys(form).forEach(key => {
          if (typeof form[key] === 'boolean') {
            form[key] = false
          } else {
            form[key] = ''
          }
        })
        
        // Clear errors
        Object.keys(errors).forEach(key => delete errors[key])
        
        // Focus on success message for screen readers
        await nextTick()
        const successMessage = document.querySelector('.success-message')
        if (successMessage) {
          successMessage.scrollIntoView({ behavior: 'smooth' })
        }
        
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

h1 {
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

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.required::after {
  content: " *";
  color: #e74c3c;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="password"],
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon::before {
  content: "⚠️";
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.fieldset {
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
}

.legend {
  font-weight: 600;
  padding: 0 0.5rem;
  color: #2c3e50;
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
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.submit-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.4);
}

.submit-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.loading {
  opacity: 0.7;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.form-errors {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.form-errors h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.form-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}

@media (max-width: 600px) {
  .form-container {
    padding: 1rem;
  }
}
</style>
