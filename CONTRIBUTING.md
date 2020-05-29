# Publishing

1. *Canary release* — commit to master, CI will do the rest, alternatively you may publish locally:
    ```bash
    $ yarn publish:canary
    ```

2. *Versioned release*:
    ```bash
    $ yarn prepare:release [-- --yes --no-git-tag-version --no-push]
    ```
    This command will run `lerna version` to update versions and push to git with appropriate tag, tag will be picked up
    by CI and actual publish will happen (`lerna publish`).
    
3. *Manual publish* — run publishing locally, it assumes you already prepared your release:
    ```bash
    $ yarn publish:fromgit
    ```
    Keep in mind that CI will fail because it will try to publish on top of your already published tags.
