export default {
  logo: <span style={{ fontWeight: 'bold' }}>ZodForm</span>,
  project: {
    link: 'https://github.com/nkalpak/zodform'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s - ZodForm'
    };
  },
  editLink: false,
  darkMode: false,
  docsRepositoryBase: 'https://github.com/nkalpak/zodform',
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://github.com/nkalpak/zodform" target="_blank">
          ZodForm
        </a>
        .
      </span>
    )
  }
};
