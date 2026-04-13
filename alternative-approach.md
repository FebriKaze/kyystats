# Alternative Approach for Chart Data Storage

## Option 1: Manual Database Setup
If SQL fails, try manual setup in Supabase Dashboard:

1. Go to **Table Editor** in Supabase Dashboard
2. Select **statistics** table
3. Click **Add Column**
4. Set:
   - Name: `chart_data`
   - Type: `text`
   - Default: `null`

## Option 2: Use Existing Column
If adding column fails, we can store chart data in existing `content` column as JSON:

```typescript
// Modify saveStatistic to store chart_data in content field
const dbData = { 
  ...rest, 
  short_desc: summary,
  content: chart_data ? JSON.stringify({
    originalContent: stat.content,
    chartData: chart_data
  }) : stat.content
};
```

## Option 3: Create New Table
Create separate table for chart data:

```sql
CREATE TABLE chart_data (
  id SERIAL PRIMARY KEY,
  statistic_id TEXT REFERENCES statistics(id),
  chart_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Debug Steps:
1. Run debug-statistics.sql to check table structure
2. Check Supabase permissions
3. Try manual column addition in dashboard
4. Use alternative approach if needed
