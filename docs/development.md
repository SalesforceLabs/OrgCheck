<h1>Development Setup Guide</h1>

<p>This guide will walk you through setting up a developer environment for OrgCheck, allowing you to deploy OrgCheck as your own unlocked package.</p>

<h2>Prerequisites</h2>
<p>Before you begin, ensure you have the following:</p>
<ul>
    <li>A development setup with two connected Salesforce orgs</li>
    <li>Salesforce CLI installed</li>
</ul>

<h2>Step 1: Clone the OrgCheck Project</h2>
<p>First, clone the OrgCheck project repository from GitHub:</p>
<pre><code>git clone https://github.com/SalesforceLabs/OrgCheck.git
cd OrgCheck</code></pre>

<h2>Step 2: Connect Developer Orgs</h2>
<p>You need two developer orgs:</p>
<ol>
    <li><strong>Dev Hub Org</strong>: Enable Unlocked Packages and Second-Generation Managed Packages settings.</li>
    <li><strong>Namespace Org</strong>: A single DevHub can link multiple namespaces, but a packaging project must be linked to one Namespace Org.</li>
</ol>

<h3>Connect Dev Hub Org</h3>
<p>Log in to your Dev Hub org and enable the necessary settings.</p>

<h3>Link Namespace in Dev Hub Org</h3>
<ol>
    <li>Go to <strong>App Launcher</strong>.</li>
    <li>Search for <strong>Namespace Registries</strong>.</li>
    <li>Click <strong>Link</strong> and sign in to your Namespace Org.</li>
</ol>

<h2>Step 3: Update Project Definition</h2>
<p>Edit the <code>sfdx-project.json</code> file to specify the namespace:</p>
<pre><code>{
  "packageDirectories": [
    {
      "path": "&lt;namespace&gt;",
      "default": true,
      "package": "&lt;namespace&gt;",
      "versionName": "Beryllium",
      "versionNumber": "4.3.2.NEXT",
      "versionDescription": "Org Check is an easy-to-install and easy-to-use Salesforce application in order to quickly analyze your org and its technical debt."
    }
  ],
  "namespace": "&lt;namespace&gt;",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "60.0"
}</code></pre>
<p>Replace <code>&lt;namespace&gt;</code> with your actual namespace.</p>

<h2>Step 4: Rename the Force-App Folder</h2>
<p>Rename the <code>force-app</code> folder to match your namespace name.</p>

<h2>Step 5: Adjust VisualForce Page</h2>
<p>Update the <code>OrgCheck_App_VFP.page</code> to point to your namespace:</p>
<pre><code>&lt;apex:page&gt;
    &lt;script&gt;
        Lightning.use('&lt;namespace&gt;:OrgCheck_App_Aura', function() {
            $Lightning.createComponent('&lt;namespace&gt;:orgcheckApp', {});
        });
    &lt;/script&gt;
&lt;/apex:page&gt;</code></pre>
<p>Replace <code>&lt;namespace&gt;</code> with your actual namespace.</p>

<h2>Step 6: Create the Package</h2>
<p>Create the package using the Salesforce CLI:</p>
<pre><code>sfdx force:package:create --name &lt;namespace&gt; --packagetype Unlocked --path &lt;namespace&gt; -v &lt;devhubalias&gt;</code></pre>
<p>Note the generated <strong>Package Id</strong>.</p>

<h2>Step 7: Create a Package Version</h2>
<p>Create a package version with the generated <strong>Package Id</strong>:</p>
<pre><code>sfdx force:package:version:create -p 0HoDn0000010wBuKAI -x -w 10 -v &lt;devhubalias&gt;</code></pre>
<p>Note the <strong>Subscriber Package Version Id</strong> from the output.</p>

<h2>Step 8: Optional - Create a Scratch Org</h2>
<p>If you want to use a scratch org, create it using:</p>
<pre><code>sf force:org:create --definitionfile orgs/dev.json --setalias &lt;scratchorgalias&gt; --targetdevhubusername &lt;devhubalias&gt; --wait 10</code></pre>

<h2>Step 9: Deploy the Package</h2>
<p>Deploy the package to your org using the <strong>Subscriber Package Version Id</strong>:</p>
<pre><code>sfdx force:package:install -p 04tDn0000011NpHIAU -u &lt;scratchorgalias&gt; -w 10</code></pre>

<h2>Debugging</h2>
<p>To debug, go to <strong>Setup</strong> in Salesforce:</p>
<ol>
    <li>Navigate to <strong>Visualforce Pages</strong>.</li>
    <li>Look for <code>OrgCheck_App_VFP</code>.</li>
    <li>Click <strong>Preview</strong> to view the page.</li>
</ol>

<p>If you encounter any issues, check the following:</p>
<ul>
    <li>Verify the Visualforce page is correctly pointing to your namespace.</li>
    <li>Ensure the namespace is correctly set in <code>sfdx-project.json</code>.</li>
</ul>

<h2>Conclusion</h2>
<p>You should now have a fully working unlocked package for OrgCheck, using your own namespace. For further assistance, refer to the official documentation or reach out to the OrgCheck community. Happy coding!</p>
