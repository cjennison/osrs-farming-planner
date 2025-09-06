---
applyTo: "**/*.{ts,tsx,js,jsx,json,md}"
---

# Internationalization (i18n) Standards

## Multi-Language Support Requirements

### Translation Coverage

- **All user-facing text MUST have corresponding translations** in all supported languages
- **Supported Languages**: English (en), French (fr), German (de)
- **No hardcoded text** is allowed in components - all text must use translation keys
- **Translation files** must be complete and maintain consistency across all three languages

### Translation File Structure

- **Location**: `/messages/` directory
- **Files**: `en.json`, `fr.json`, `de.json`
- **Structure**: Nested JSON objects organized by page/component
- **Naming**: Use descriptive, hierarchical keys (e.g., `ContactPage.form.fields.name.label`)

### Implementation Requirements

- **next-intl Integration**: Use `useTranslations()` hook for all text
- **Dynamic Content**: Support interpolation for dynamic values (e.g., `{hours}`, `{name}`)
- **Locale Detection**: Automatic browser-based locale detection with manual override
- **URL Structure**: Locale-aware routing with `/[locale]/` prefix
- **Rich Translations**: String splitting is strictly forbidden. `t.rich()` is the only acceptable implementation for complex translations.

### Content Guidelines

- **Professional Tone**: Maintain business-appropriate language across all translations
- **Cultural Sensitivity**: Ensure translations are culturally appropriate for target regions
- **Technical Accuracy**: Preserve technical terminology and context in translations
- **Consistency**: Use consistent terminology across all pages and components

### Language-Specific Considerations

#### French (fr)
- Use formal language ("vous" form)
- Include language disclaimer for non-native speaker communication
- Maintain professional business terminology

#### German (de)
- Use formal language ("Sie" form)
- Include language proficiency disclaimer (C1 reading, B2 speaking)
- Preserve technical English terms where commonly used

### Development Workflow

1. **Add English text first** with descriptive translation keys
2. **Provide French and German translations** for all new keys
3. **Test all language variants** before code review
4. **Update documentation** when adding new translation namespaces

### Translation Key Organization

```json
{
  "ComponentName": {
    "section": {
      "title": "Section Title",
      "subtitle": "Section subtitle with {dynamicValue}",
      "fields": {
        "fieldName": {
          "label": "Field Label",
          "placeholder": "Field placeholder",
          "validation": "Validation message"
        }
      }
    }
  }
}
```

### Quality Assurance

- **Complete Coverage**: Every translation key must exist in all three language files
- **No Missing Keys**: Build process should fail if translation keys are missing
- **Contextual Testing**: Test UI with all languages to ensure proper layout and flow
- **Professional Review**: Consider native speaker review for business-critical content

### Examples

#### ✅ Correct Implementation
```tsx
const t = useTranslations('ContactPage');

<Title>{t('header.title')}</Title>
<Text>{t('form.subtitle', { hours: 48 })}</Text>
```

#### ❌ Incorrect Implementation
```tsx
<Title>Contact Us</Title> // Hardcoded text
<Text>We'll respond in 48 hours</Text> // No translation support
```

### Maintenance

- **Regular Audits**: Periodically review translations for accuracy and consistency
- **Version Control**: Track translation changes in git for proper review
- **Documentation Updates**: Update this file when adding new languages or changing processes
