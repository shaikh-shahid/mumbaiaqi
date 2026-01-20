# Contributing to Mumbai AQI Resolution System

Thank you for your interest in contributing to the Mumbai AQI Resolution System! This project is community-driven, and we welcome contributions from anyone who wants to help improve air quality recommendations for Mumbai.

## How to Contribute

### Adding New Zones

You can add new zones to expand coverage of Mumbai:

1. **Fork the repository** and clone it to your local machine
2. **Edit `data/zones.json`** to add a new zone entry
3. **Create a Pull Request** with your changes
4. **Wait for review** - maintainers will review and merge your PR

#### Zone Format

Each zone should follow this structure:

```json
{
  "id": <next_available_id>,
  "name": "Zone Name",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "baseline_aqi": 150,
  "proximity_to_sea": "Close | Moderate | Far",
  "green_space_percentage": 15.0,
  "land_use_type": "Residential/Commercial | Industrial/Residential | etc.",
  "major_roads": "Road 1, Road 2, Road 3",
  "parks_and_open_spaces": "Park 1, Park 2",
  "industrial_areas": "None | Some | Heavy",
  "pollution_sources": "Vehicular traffic, construction, etc.",
  "population_density": "High | Moderate | Low"
}
```

**Important**: 
- Use the next available `id` (check existing zones to find the highest ID, then add 1)
- Ensure coordinates are accurate for Mumbai
- Provide realistic baseline AQI based on the area's known pollution levels

### Adding or Editing Recommendations

The recommendations are stored in `data/recommendations.json`. You can contribute by:

1. **Fork the repository** and clone it to your local machine
2. **Edit `data/recommendations.json`** to add or modify recommendations
3. **Create a Pull Request** with your changes
4. **Wait for review** - maintainers will review and merge your PR

### Recommendation Format

Each recommendation should follow this structure:

```json
{
  "id": "rec-{zone_id}-{unique_number}",
  "title": "Clear, descriptive title (15-20 words) - Include Impact Level",
  "description": "Detailed description (5-8 sentences) explaining the recommendation, why it's important for this specific zone, and how it addresses pollution sources. Include specific locations, roads, or areas when relevant.",
  "aqi_reduction": 25,
  "impact_level": "High Impact | Medium Impact | Low Impact",
  "timeframe": "Short term (0-6 months) | Medium term (6-18 months) | Long term (18+ months)",
  "cost": "Low (<10L) | Medium (10L-50L) | High (>50L)",
  "stakeholders": "List of key stakeholders (e.g., Municipal Corporation, Traffic Police, Residents)",
  "created_at": "2024-01-15T00:00:00Z",
  "created_by": "your-github-username",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### Guidelines for Recommendations

1. **Be Location-Specific**: Recommendations should be tailored to the specific zone. Use actual road names, parks, and landmarks from that area.

2. **Be Realistic**: 
   - AQI reduction should be between 5-40 points
   - Cost estimates should be reasonable for Mumbai context
   - Timeframes should be achievable

3. **Be Comprehensive**: Include:
   - What exactly will be done (technical details)
   - Where it will be implemented (specific locations)
   - Why it's important for this zone
   - How it addresses pollution sources

4. **Impact Levels**:
   - **High Impact**: Expected to reduce AQI by 25+ points
   - **Medium Impact**: Expected to reduce AQI by 10-24 points
   - **Low Impact**: Expected to reduce AQI by 5-9 points

5. **Timeframes**:
   - **Short term**: Can be implemented in 0-6 months
   - **Medium term**: Requires 6-18 months
   - **Long term**: Takes 18+ months

6. **Cost Estimates** (in Indian Rupees):
   - **Low**: Less than 10 lakhs (<10L)
   - **Medium**: 10 lakhs to 50 lakhs (10L-50L)
   - **High**: More than 50 lakhs (>50L)

### Example Recommendation

```json
{
  "id": "rec-1-8",
  "title": "Install Air Purification Towers at Major Traffic Intersections - High Impact",
  "description": "Install large-scale air purification towers at key traffic intersections in Juhu, specifically at Juhu Beach Road and SV Road junctions. These towers use HEPA filters and activated carbon to remove PM2.5, PM10, and other pollutants from the air. Given Juhu's high vehicular traffic and beach activities, these towers will significantly improve air quality in the immediate vicinity. The towers should be solar-powered to ensure sustainability and placed at strategic locations where pedestrian traffic is high. This intervention directly addresses the vehicular emissions that contribute to Juhu's air pollution.",
  "aqi_reduction": 28,
  "impact_level": "High Impact",
  "timeframe": "Medium term",
  "cost": "High",
  "stakeholders": "BMC, Environmental Department, Local Residents Association",
  "created_at": "2024-01-15T10:30:00Z",
  "created_by": "community-contributor",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Finding Zone IDs

Zone IDs can be found in `data/zones.json`. Each zone has an `id` field that you'll use in the recommendation's `zone_id`.

### Adding Recommendations to a Zone

1. Open `data/recommendations.json`
2. Find the zone you want to add recommendations to (or create a new entry if it doesn't exist)
3. Add your recommendation to the `recommendations` array
4. Ensure the `id` is unique (format: `rec-{zone_id}-{number}`)
5. Set `created_by` to your GitHub username
6. Set both `created_at` and `updated_at` to the current timestamp

### Editing Existing Recommendations

1. Find the recommendation in `data/recommendations.json`
2. Make your edits
3. Update the `updated_at` timestamp
4. Optionally add your GitHub username to `updated_by` (if you add this field)

### Pull Request Process

1. **Create a descriptive PR title**: e.g., "Add traffic management recommendations for Bandra"
2. **Describe your changes**: Explain what recommendations you added/edited and why
3. **Follow the format**: Ensure your JSON is valid and follows the schema
4. **Be patient**: Maintainers will review your PR and may suggest improvements

### Code of Conduct

- Be respectful and constructive in your contributions
- Focus on improving air quality recommendations
- Provide accurate, well-researched recommendations
- Follow the existing format and style

### Questions?

If you have questions about contributing, please:
- Open an issue on GitHub
- Check existing issues and PRs for examples
- Review the JSON schema in `data/recommendations.json`

Thank you for helping make Mumbai's air cleaner! 
