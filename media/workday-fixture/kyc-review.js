// Synthetic demo: accepts extracted fields, not documents or model credentials.
// These checks prepare a review; they do not verify identity or approve KYC.
export function prepareReview(application, extracted) {
  const flags = [];
  const name = typeof extracted?.name === 'string' ? extracted.name.trim() : '';
  const dateOfBirth = typeof extracted?.dateOfBirth === 'string' ? extracted.dateOfBirth.trim() : '';
  if (!extracted || extracted.readable !== true) flags.push('Document needs manual reading');
  if (!name) flags.push('Name missing');
  if (!dateOfBirth) flags.push('Date of birth missing');
  if (name && name !== application.name) flags.push('Name differs from application');
  if (dateOfBirth && dateOfBirth !== application.dateOfBirth) flags.push('Date of birth differs from application');
  return { status: 'needs-reviewer', fields: { name, dateOfBirth }, flags };
}
