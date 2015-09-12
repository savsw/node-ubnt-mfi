About
-----

These tests are somewhat primitive given that we haven't explored much of the mFi API yet. The goal is to write tests not just against node-ubnt-mfi, but also against a live mFi controller so that we can both better understand the mFi API and also become aware of changes to the mFi API published by ubiquiti.

Tests require mocha and chai.

For the tests to run successfully, you must have an mFi controller to test against. The connection settings for the mFi controller used during testing are stored in config.json, which we've provided an example of.

#### Housekeeping

When you make changes to ```test/config.json``` to suit your local testing environment, those changes shouldn't ever get pushed upstream. Please be sure to run the following command:
```bash
git update-index --assume-unchanged test/config.json
```