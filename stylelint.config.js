import { stylelintConfig } from '@kitschpatrol/stylelint-config'

export default stylelintConfig({
	overrides: [
		{
			extends: ['stylelint-config-standard-scss'],
			files: ['**/*.scss'],
			rules: {
				// Tweakpane core styles hover without a (hover: hover) query, so plugin controls match it.
				'defensive-css/no-accidental-hover': null,
				// Tweakpane core styles focus with :focus, so plugin controls match it.
				'defensive-css/require-focus-visible': null,
			},
		},
	],
})
