# Company Dashboard - Form Progress Tracking

This feature adds a company dashboard that tracks how users are filling out loan application forms in real-time.

## Features

- **Real-time Progress Tracking**: Monitor users as they progress through form steps
- **Form Analytics**: View completion rates, abandonment rates, and average completion times
- **User Activity Monitoring**: See when users last interacted with forms
- **Status Filtering**: Filter by in-progress, completed, or abandoned forms
- **Live Updates**: Dashboard updates automatically as users interact with forms

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the required table:

```sql
-- Execute this in your Supabase SQL editor
-- File: database/form_progress_setup.sql
```

The script creates:
- `form_progress` table to store user progress data
- Indexes for optimal performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 2. Access the Dashboard

Navigate to `/company-dashboard` in your application or use the "Progress Dashboard" link in the profile dropdown.

## How It Works

### Progress Tracking Hook

The `useFormProgress` hook automatically tracks:
- Current step in the form
- Time spent on the form
- Last activity timestamp
- Form completion status

### Form Integration

Forms automatically track progress when:
- User moves between steps
- User completes the form
- User abandons the form (leaves page)

### Dashboard Features

#### Statistics Cards
- **Active Users**: Currently filling out forms
- **Completed**: Successfully submitted forms
- **Abandoned**: Forms left incomplete
- **Average Time**: Time to complete forms
- **Success Rate**: Completion percentage

#### Progress Table
- User information and contact details
- Form type (informal/formal)
- Visual progress bar
- Current step information
- Status indicators
- Time tracking
- Last activity timestamps

#### Real-time Updates
- Automatic refresh every 30 seconds
- Live database subscriptions
- Instant status updates

## Technical Implementation

### Files Added/Modified

1. **New Files**:
   - `src/pages/CompanyDashboard.tsx` - Main dashboard component
   - `src/hooks/useFormProgress.ts` - Progress tracking hook
   - `database/form_progress_setup.sql` - Database schema

2. **Modified Files**:
   - `src/App.tsx` - Added dashboard route
   - `src/components/ProfileDropdown.tsx` - Added navigation link
   - `src/pages/loan/request/informal.tsx` - Integrated progress tracking

### Database Schema

```sql
form_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  form_type TEXT ('informal' | 'formal'),
  current_step INTEGER,
  total_steps INTEGER,
  step_name TEXT,
  progress_percentage INTEGER (0-100),
  status TEXT ('in_progress' | 'completed' | 'abandoned'),
  time_spent INTEGER, -- minutes
  last_activity TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Usage Examples

### For Company Administrators

1. **Monitor Active Users**:
   - See who is currently filling out forms
   - Identify users who might need assistance
   - Track completion rates in real-time

2. **Analyze Form Performance**:
   - Identify steps where users commonly abandon forms
   - Optimize forms based on completion data
   - Monitor average completion times

3. **User Support**:
   - Proactively reach out to users stuck on specific steps
   - Provide assistance based on progress data
   - Follow up on abandoned applications

### Integration with Other Forms

To add progress tracking to other forms:

```typescript
// In your form component
import { useFormProgress } from '../hooks/useFormProgress';

const YourForm = () => {
  const { updateProgress, markCompleted } = useFormProgress('formal', 5);
  
  // Update progress when step changes
  useEffect(() => {
    updateProgress(currentStep, stepNames[currentStep]);
  }, [currentStep]);
  
  // Mark as completed on submission
  const onSubmit = async (data) => {
    // ... submit logic
    await markCompleted();
  };
};
```

## Security & Privacy

- **Row Level Security**: Users can only see their own progress data
- **Admin Access**: Special policies allow admins to view all progress
- **Data Protection**: No sensitive form data is stored in progress tracking
- **Automatic Cleanup**: Progress data can be automatically purged after completion

## Performance Considerations

- **Indexed Queries**: Database indexes optimize dashboard queries
- **Real-time Subscriptions**: Efficient WebSocket connections for live updates
- **Batch Updates**: Progress updates are batched to reduce database load
- **Caching**: Dashboard data is cached for improved performance

## Troubleshooting

### Common Issues

1. **Dashboard shows no data**:
   - Ensure database migration was run
   - Check RLS policies are correctly configured
   - Verify user has admin permissions

2. **Progress not updating**:
   - Check browser console for errors
   - Verify Supabase connection
   - Ensure form is using the progress hook

3. **Real-time updates not working**:
   - Check WebSocket connection
   - Verify Supabase real-time is enabled
   - Check browser network connectivity

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG_PROGRESS=true
```

This will log all progress tracking events to the browser console.