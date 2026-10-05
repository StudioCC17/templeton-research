// lib/formCopy.js
// TEMPORARY: a hidden (BCC) copy of every form email - contact, CV and
// internship - goes to Edd while the forms bed in after launch. The client
// doesn't see this address. To stop it, empty the list (FORMS_BCC = []) or
// delete this file and the two imports in app/api/contact + app/api/apply.
export const FORMS_BCC = ['edd@ccseventeen.com']

// Skip anyone already on the To line (e.g. when testing with an override)
export const bccFor = (to) => {
  const already = to.map((a) => a.toLowerCase())
  return FORMS_BCC.filter((a) => !already.includes(a.toLowerCase()))
}
